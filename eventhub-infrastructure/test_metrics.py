#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Prometheus metrics en boucle -- lance: python test_metrics.py
Rafraichit toutes les 5 secondes. Ctrl+C pour quitter.
"""
import sys
import os
import time
import urllib.request
import urllib.parse
import json
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

PROMETHEUS = "http://localhost:9090"
INTERVAL   = 5  # secondes

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

SERVICES = ["auth-service", "event-service", "booking-service"]

def clear():
    os.system("cls" if os.name == "nt" else "clear")

def query(promql):
    url = f"{PROMETHEUS}/api/v1/query?query={urllib.parse.quote(promql)}"
    try:
        with urllib.request.urlopen(url, timeout=4) as r:
            data = json.loads(r.read())
            if data["status"] == "success":
                return data["data"]["result"]
    except Exception:
        pass
    return []

def scalar(results):
    """Retourne la somme des valeurs d'un vecteur de resultats."""
    if not results:
        return None
    return sum(float(x["value"][1]) for x in results)

def bar(pct, width=24):
    """Barre de progression 0.0 -> 1.0"""
    filled = int(min(pct, 1.0) * width)
    return "#" * filled + "." * (width - filled)

def color_pct(pct):
    if pct > 0.80: return RED
    if pct > 0.50: return YELLOW
    return GREEN

def check_prometheus():
    try:
        with urllib.request.urlopen(f"{PROMETHEUS}/-/healthy", timeout=3) as r:
            return r.status == 200
    except:
        return False

def header(title):
    print(f"\n{BOLD}{CYAN}{'='*56}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'='*56}{RESET}")

def run():
    now = datetime.now().strftime("%H:%M:%S")
    print(f"{BOLD}{'='*56}")
    print(f"  EVENTHUB -- RESSOURCES & METRIQUES")
    print(f"  Refresh: {now}  (Ctrl+C pour quitter)")
    print(f"{'='*56}{RESET}")

    if not check_prometheus():
        print(f"{RED}[FAIL] Prometheus non joignable sur localhost:9090{RESET}")
        return
    print(f"{GREEN}[OK] Prometheus en ligne{RESET}")

    # ── 1. Services UP / DOWN ─────────────────────────
    header("1. SERVICES UP / DOWN")
    all_services = {
        "auth-service":    'up{job="auth-service"}',
        "event-service":   'up{job="event-service"}',
        "booking-service": 'up{job="booking-service"}',
        "api-gateway":     'up{job="api-gateway"}',
        "eureka-server":   'up{job="eureka-server"}',
    }
    for name, q in all_services.items():
        r = query(q)
        if r and r[0]["value"][1] == "1":
            print(f"  {GREEN}[UP  ] {name}{RESET}")
        elif r and r[0]["value"][1] == "0":
            print(f"  {RED}[DOWN] {name}{RESET}")
        else:
            print(f"  {YELLOW}[ N/A] {name}{RESET}")

    # ── 2. CPU ────────────────────────────────────────
    header("2. CPU  (usage processus Java)")
    print(f"  {'SERVICE':<22} {'CPU %':>7}   BARRE")
    print(f"  {'-'*52}")
    for svc in SERVICES:
        # process_cpu_usage = % CPU utilise par le processus JVM (0.0 -> 1.0)
        r = query(f'process_cpu_usage{{job="{svc}"}}')
        v = scalar(r)
        if v is not None:
            pct   = v                       # 0.0 -> 1.0
            c     = color_pct(pct)
            b     = bar(pct)
            print(f"  {svc:<22} {c}{pct*100:>6.2f}%   [{b}]{RESET}")
        else:
            print(f"  {svc:<22} {YELLOW}N/A{RESET}")

    # ── 3. RAM (Heap JVM) ─────────────────────────────
    header("3. RAM  -- Heap JVM utilise / max")
    print(f"  {'SERVICE':<22} {'UTILISE':>8}  {'MAX':>8}  {'%':>6}   BARRE")
    print(f"  {'-'*66}")
    for svc in SERVICES:
        r_used = query(f'sum(jvm_memory_used_bytes{{job="{svc}",area="heap"}})')
        r_max  = query(f'sum(jvm_memory_max_bytes{{job="{svc}",area="heap"}})')
        used   = scalar(r_used)
        maxi   = scalar(r_max)
        if used is not None and maxi and maxi > 0:
            used_mb = used / (1024*1024)
            max_mb  = maxi / (1024*1024)
            pct     = used / maxi
            c       = color_pct(pct)
            b       = bar(pct)
            print(f"  {svc:<22} {c}{used_mb:>7.1f}M  {max_mb:>7.1f}M  {pct*100:>5.1f}%   [{b}]{RESET}")
        elif used is not None:
            used_mb = used / (1024*1024)
            print(f"  {svc:<22} {GREEN}{used_mb:>7.1f}M{RESET}  {YELLOW}max N/A{RESET}")
        else:
            print(f"  {svc:<22} {YELLOW}N/A{RESET}")

    # ── 4. RAM Non-Heap (metaspace, code cache) ────────
    header("4. RAM  -- Non-Heap (Metaspace + Code Cache)")
    print(f"  {'SERVICE':<22} {'NON-HEAP':>10}")
    print(f"  {'-'*36}")
    for svc in SERVICES:
        r = query(f'sum(jvm_memory_used_bytes{{job="{svc}",area="nonheap"}})')
        v = scalar(r)
        if v is not None:
            mb = v / (1024*1024)
            c  = RED if mb > 300 else (YELLOW if mb > 150 else GREEN)
            print(f"  {svc:<22} {c}{mb:>9.1f} MB{RESET}")
        else:
            print(f"  {svc:<22} {YELLOW}N/A{RESET}")

    # ── 5. Threads JVM ────────────────────────────────
    header("5. THREADS JVM (actifs)")
    print(f"  {'SERVICE':<22} {'LIVE':>6}  {'DAEMON':>8}  {'PEAK':>6}")
    print(f"  {'-'*48}")
    for svc in SERVICES:
        live   = scalar(query(f'jvm_threads_live_threads{{job="{svc}"}}'))
        daemon = scalar(query(f'jvm_threads_daemon_threads{{job="{svc}"}}'))
        peak   = scalar(query(f'jvm_threads_peak_threads{{job="{svc}"}}'))
        if live is not None:
            c = RED if live > 200 else (YELLOW if live > 100 else GREEN)
            d = f"{daemon:.0f}" if daemon is not None else "?"
            p = f"{peak:.0f}"   if peak   is not None else "?"
            print(f"  {svc:<22} {c}{live:>6.0f}{RESET}  {d:>8}  {p:>6}")
        else:
            print(f"  {svc:<22} {YELLOW}N/A{RESET}")

    # ── 6. Requetes HTTP (5 min) ──────────────────────
    header("6. REQUETES HTTP (5 min) -- hors actuator")
    http_q = ('sum by (uri, method, status) '
               '(increase(http_server_requests_seconds_count'
               '{uri!~"/actuator.*"}[5m]) > 0)')
    reqs = query(http_q)
    if reqs:
        reqs_sorted = sorted(reqs, key=lambda x: float(x["value"][1]), reverse=True)[:8]
        print(f"  {'URI':<38} {'MTH':<6} {'STA':<5} COUNT")
        print(f"  {'-'*58}")
        for r in reqs_sorted:
            m      = r["metric"]
            uri    = m.get("uri", "?")[:37]
            method = m.get("method", "?")[:5]
            status = m.get("status", "?")
            count  = float(r["value"][1])
            c = RED if str(status).startswith("5") else (YELLOW if str(status).startswith("4") else GREEN)
            print(f"  {uri:<38} {method:<6} {c}{status:<5}{RESET} {count:.0f}")
    else:
        print(f"  {YELLOW}Aucune requete metier (utilise l'application pour en generer){RESET}")

    # ── 7. Connexions DB ──────────────────────────────
    header("7. BASE DE DONNEES (HikariCP)")
    print(f"  {'SERVICE':<22} {'ACTIVES':>8}  {'EN ATTENTE':>12}  {'POOL MAX':>10}")
    print(f"  {'-'*58}")
    for svc in SERVICES:
        active  = scalar(query(f'hikaricp_connections_active{{job="{svc}"}}'))
        pending = scalar(query(f'hikaricp_connections_pending{{job="{svc}"}}'))
        maxpool = scalar(query(f'hikaricp_connections{{job="{svc}"}}'))
        if active is not None:
            ca = YELLOW if active > 5 else GREEN
            cp = RED if (pending or 0) > 0 else GREEN
            m  = f"{maxpool:.0f}" if maxpool else "?"
            print(f"  {svc:<22} {ca}{active:>8.0f}{RESET}  {cp}{(pending or 0):>12.0f}{RESET}  {m:>10}")
        else:
            print(f"  {svc:<22} {YELLOW}N/A{RESET}")

    print(f"\n{DIM}Prochain refresh dans {INTERVAL}s...{RESET}")

# ── Boucle principale ─────────────────────────────────
print(f"{CYAN}Demarrage du monitoring... (Ctrl+C pour quitter){RESET}")
time.sleep(0.5)
iteration = 0
try:
    while True:
        iteration += 1
        clear()
        print(f"{DIM}Iteration #{iteration}{RESET}")
        run()
        time.sleep(INTERVAL)
except KeyboardInterrupt:
    print(f"\n{BOLD}Arret du monitoring.{RESET}\n")
