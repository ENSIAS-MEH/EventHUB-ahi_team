#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Zipkin traces en boucle -- lance: python test_traces.py
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

ZIPKIN   = "http://localhost:9411"
LIMIT    = 10    # traces a afficher
LOOKBACK = 5     # minutes en arriere (fenetre courte pour voir le flux en temps reel)
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

SERVICE_COLORS = {
    "api-gateway":     CYAN,
    "auth-service":    MAGENTA,
    "event-service":   BLUE,
    "booking-service": GREEN,
}

def clear():
    os.system("cls" if os.name == "nt" else "clear")

def check_zipkin():
    try:
        with urllib.request.urlopen(f"{ZIPKIN}/health", timeout=3) as r:
            return r.status == 200
    except Exception:
        return False

def get(path):
    try:
        with urllib.request.urlopen(f"{ZIPKIN}{path}", timeout=6) as r:
            return json.loads(r.read())
    except Exception:
        return None

def format_ts(us):
    try:
        dt = datetime.fromtimestamp(int(us) / 1e6, tz=timezone.utc).astimezone()
        return dt.strftime("%H:%M:%S")
    except Exception:
        return "?"

def duration_str(us):
    ms = int(us) / 1000
    return f"{ms/1000:.2f}s" if ms >= 1000 else f"{ms:.0f}ms"

def duration_bar(us, max_us):
    if max_us == 0:
        return "." * 20
    pct    = min(int(us) / max_us, 1.0)
    blocks = int(pct * 20)
    return "#" * blocks + "." * (20 - blocks)

def header(title):
    print(f"\n{BOLD}{CYAN}{'='*62}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'='*62}{RESET}")

def run(iteration):
    now = datetime.now().strftime("%H:%M:%S")

    print(f"{BOLD}{'='*62}")
    print(f"  EVENTHUB -- TRACES ZIPKIN  (fenetre: {LOOKBACK} min)")
    print(f"  Refresh #{iteration}  {now}  (Ctrl+C pour quitter)")
    print(f"{'='*62}{RESET}")

    if not check_zipkin():
        print(f"{RED}[FAIL] Zipkin non joignable sur localhost:9411{RESET}")
        return

    print(f"{GREEN}[OK] Zipkin en ligne{RESET}")

    # -- 1. Services enregistres ----------------------
    header("1. SERVICES ENREGISTRES")
    services = get("/api/v2/services")
    if services:
        line_parts = []
        for s in sorted(services):
            color = SERVICE_COLORS.get(s, YELLOW)
            line_parts.append(f"{color}[{s}]{RESET}")
        print(f"  {' '.join(line_parts)}")
    else:
        print(f"  {YELLOW}Aucun service (pas encore de trafic){RESET}")

    # -- 2. Traces recentes ---------------------------
    header(f"2. TRACES RECENTES (dernieres {LOOKBACK} min, max {LIMIT})")
    lookback_ms = LOOKBACK * 60 * 1000
    params      = urllib.parse.urlencode({"limit": LIMIT, "lookback": lookback_ms})
    traces      = get(f"/api/v2/traces?{params}")

    if not traces:
        print(f"  {YELLOW}Aucune trace -- naviguez sur http://localhost pour en generer{RESET}")
    else:
        durations = [max((int(sp.get("duration", 0)) for sp in t), default=0) for t in traces if t]
        max_dur   = max(durations) if durations else 1

        print(f"  {len(traces)} trace(s) trouvee(s)\n")
        print(f"  {'HH:MM:SS':<10} {'SERVICE':<22} {'OPERATION':<28} {'DUREE':<8} SPANS")
        print(f"  {'-'*78}")

        for trace in traces[:LIMIT]:
            if not trace:
                continue
            root     = next((s for s in trace if "parentId" not in s), trace[0])
            svc      = root.get("localEndpoint", {}).get("serviceName", "?")
            op       = root.get("name", "?")[:27]
            ts       = format_ts(root.get("timestamp", 0))
            dur_us   = root.get("duration", 0)
            dur      = duration_str(dur_us)
            spans    = len(trace)
            color    = SERVICE_COLORS.get(svc, YELLOW)
            has_err  = any(s.get("tags", {}).get("error") for s in trace)
            status   = root.get("tags", {}).get("http.status_code", "")
            is_err   = has_err or str(status).startswith("5")
            err_flag = f" {RED}[ERR]{RESET}" if is_err else ""
            bar      = duration_bar(dur_us, max_dur)

            print(f"  {DIM}{ts:<10}{RESET} {color}{svc:<22}{RESET} "
                  f"{op:<28} {YELLOW}{dur:<8}{RESET} {spans}{err_flag}")
            print(f"  {DIM}  [{bar}]{RESET}")

    # -- 3. Resume par service ------------------------
    header("3. RESUME PAR SERVICE (5 min)")
    params30 = urllib.parse.urlencode({"limit": 50, "lookback": 5 * 60 * 1000})
    traces30 = get(f"/api/v2/traces?{params30}")

    if traces30:
        svc_stats = {}
        for trace in traces30:
            for span in trace:
                svc = span.get("localEndpoint", {}).get("serviceName")
                if not svc:
                    continue
                if svc not in svc_stats:
                    svc_stats[svc] = {"spans": 0, "total_us": 0, "errors": 0}
                svc_stats[svc]["spans"]    += 1
                svc_stats[svc]["total_us"] += span.get("duration", 0)
                if span.get("tags", {}).get("error"):
                    svc_stats[svc]["errors"] += 1

        print(f"  {'SERVICE':<24} {'SPANS':>6}  {'MOY':>8}  {'ERREURS':>8}")
        print(f"  {'-'*52}")
        for svc, stat in sorted(svc_stats.items()):
            color    = SERVICE_COLORS.get(svc, YELLOW)
            avg      = duration_str(stat["total_us"] // max(stat["spans"], 1))
            err_col  = RED if stat["errors"] > 0 else GREEN
            err_flag = "[ERR]" if stat["errors"] > 0 else "[ OK]"
            print(f"  {color}{svc:<24}{RESET} {stat['spans']:>6}  {avg:>8}  "
                  f"{err_col}{err_flag} {stat['errors']}{RESET}")
    else:
        print(f"  {YELLOW}Pas de traces dans les 5 dernieres minutes{RESET}")

    print(f"\n{DIM}Prochain refresh dans {INTERVAL}s...{RESET}")

# -- Boucle principale --------------------------------
print(f"{CYAN}Demarrage du monitoring traces... (Ctrl+C pour quitter){RESET}")
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
