#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Loki logs en boucle -- lance: python test_logs.py
Rafraichit toutes les 5 secondes. Ctrl+C pour quitter.
"""
import sys
import os
import time
import urllib.request
import urllib.parse
import json
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding="utf-8")

LOKI     = "http://localhost:3100"
LINES    = 6     # logs par service par refresh
MINUTES  = 5     # fenetre de temps (plus courte pour voir les nouveaux logs)
INTERVAL = 5     # secondes entre chaque refresh

GREEN   = "\033[92m"
RED     = "\033[91m"
YELLOW  = "\033[93m"
CYAN    = "\033[96m"
BLUE    = "\033[94m"
MAGENTA = "\033[95m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
RESET   = "\033[0m"

LEVEL_COLORS = {
    "ERROR": RED,
    "WARN":  YELLOW,
    "INFO":  GREEN,
    "DEBUG": DIM,
}

SERVICES = [
    ("auth-service",    MAGENTA, "AUTH-SERVICE"),
    ("event-service",   BLUE,    "EVENT-SERVICE"),
    ("booking-service", CYAN,    "BOOKING-SERVICE"),
]

# Cache du format de label detecte (evite la detection a chaque refresh)
_label_cache = {}

def clear():
    os.system("cls" if os.name == "nt" else "clear")

def check_loki():
    try:
        urllib.request.urlopen(f"{LOKI}/ready", timeout=3)
        return True
    except urllib.error.HTTPError as e:
        return e.code == 503  # 503 = warm-up, mais fonctionnel
    except Exception:
        return False

def query_logs(logql, limit=LINES):
    now_ns   = int(time.time() * 1e9)
    start_ns = now_ns - int(MINUTES * 60 * 1e9)
    params   = urllib.parse.urlencode({
        "query": logql, "limit": limit,
        "start": start_ns, "end": now_ns,
        "direction": "backward",
    })
    try:
        with urllib.request.urlopen(f"{LOKI}/loki/api/v1/query_range?{params}", timeout=6) as r:
            data = json.loads(r.read())
            if data["status"] == "success":
                entries = []
                for stream in data["data"]["result"]:
                    for ts, line in stream["values"]:
                        entries.append((int(ts), line))
                entries.sort(key=lambda x: x[0], reverse=True)
                return entries[:limit]
    except Exception:
        pass
    return []

def count_logs(logql):
    now_ns = int(time.time() * 1e9)
    params = urllib.parse.urlencode({"query": logql, "time": now_ns})
    try:
        with urllib.request.urlopen(f"{LOKI}/loki/api/v1/query?{params}", timeout=6) as r:
            data    = json.loads(r.read())
            results = data["data"]["result"]
            if results:
                return int(sum(float(x["value"][1]) for x in results))
    except Exception:
        pass
    return 0

def detect_container_label(name):
    if name in _label_cache:
        return _label_cache[name]
    now_ns   = int(time.time() * 1e9)
    start_ns = now_ns - int(10 * 60 * 1e9)
    for candidate in [f"/{name}", name]:
        params = urllib.parse.urlencode({
            "query": f'{{container="{candidate}"}}',
            "limit": 1, "start": start_ns, "end": now_ns,
        })
        try:
            with urllib.request.urlopen(f"{LOKI}/loki/api/v1/query_range?{params}", timeout=4) as r:
                if json.loads(r.read())["data"]["result"]:
                    _label_cache[name] = candidate
                    return candidate
        except Exception:
            pass
    _label_cache[name] = f"/{name}"
    return f"/{name}"

def format_ts(ns):
    dt = datetime.fromtimestamp(int(ns) / 1e9, tz=timezone.utc).astimezone()
    return dt.strftime("%H:%M:%S")

def extract_level(line):
    try:
        return json.loads(line).get("level", "").upper()
    except Exception:
        for lvl in ["ERROR", "WARN", "INFO", "DEBUG"]:
            if lvl in line.upper():
                return lvl
    return ""

def extract_message(line):
    try:
        return json.loads(line).get("message", line)[:100]
    except Exception:
        return line[:100]

def header(title):
    print(f"\n{BOLD}{CYAN}{'='*58}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'='*58}{RESET}")

def run(iteration):
    now = datetime.now().strftime("%H:%M:%S")

    print(f"{BOLD}{'='*58}")
    print(f"  EVENTHUB -- LOGS LOKI  (fenetre: {MINUTES} min)")
    print(f"  Refresh #{iteration}  {now}  (Ctrl+C pour quitter)")
    print(f"{'='*58}{RESET}")

    if not check_loki():
        print(f"{RED}[FAIL] Loki non joignable sur localhost:3100{RESET}")
        return

    print(f"{GREEN}[OK] Loki en ligne{RESET}")

    # -- Logs par service -----------------------------
    for svc, color, label in SERVICES:
        container = detect_container_label(svc)
        header(f"LOGS {label}  [{container}]")
        entries = query_logs(f'{{container="{container}"}}', limit=LINES)
        if not entries:
            print(f"  {YELLOW}Aucun log dans les {MINUTES} dernieres minutes{RESET}")
        else:
            for ts, line in entries:
                lvl    = extract_level(line)
                msg    = extract_message(line)
                lc     = LEVEL_COLORS.get(lvl, "")
                ts_str = format_ts(ts)
                print(f"  {DIM}{ts_str}{RESET} {lc}{lvl:<5}{RESET} {color}{msg}{RESET}")

    # -- Erreurs recentes -----------------------------
    header("ERREURS RECENTES (tous services)")
    errors = query_logs('{job="eventhub"} |= "ERROR"', limit=5)
    if errors:
        for ts, line in errors:
            print(f"  {RED}[ERR] {format_ts(ts)} {extract_message(line)}{RESET}")
    else:
        print(f"  {GREEN}[OK] Aucune erreur dans les {MINUTES} dernieres minutes{RESET}")

    # -- Statistiques ---------------------------------
    header("STATS (lignes dans les 5 dernieres min)")
    for svc, color, label in SERVICES:
        container = detect_container_label(svc)
        n   = count_logs(f'count_over_time({{container="{container}"}}[5m])')
        bar = "#" * min(n, 40)
        print(f"  {color}{label:<20}{RESET} {n:>5} lignes  {DIM}[{bar}]{RESET}")

    print(f"\n{DIM}Prochain refresh dans {INTERVAL}s...{RESET}")

# -- Boucle principale --------------------------------
print(f"{CYAN}Demarrage du monitoring logs... (Ctrl+C pour quitter){RESET}")
time.sleep(0.3)
iteration = 0
try:
    while True:
        iteration += 1
        clear()
        print(f"{DIM}Iteration #{iteration}{RESET}")
        run(iteration)
        time.sleep(INTERVAL)
except KeyboardInterrupt:
    print(f"\n{BOLD}Arret du monitoring.{RESET}\n")
