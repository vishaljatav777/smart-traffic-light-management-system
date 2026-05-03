import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend — no popup window blocking shutdown
import matplotlib.pyplot as plt
import csv
import os

def plot_metrics(filename="traffic_metrics.csv"):
    # FIX #3: Guard against empty/missing CSV
    if not os.path.exists(filename):
        print(f"[Plot] File '{filename}' not found. Skipping plot.")
        return

    cycles = []
    avg_wait = []
    throughput = []

    try:
        with open(filename, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                cycles.append(int(row["Cycle"]))
                avg_wait.append(float(row["Average_Waiting_Time"]))
                throughput.append(int(row["Throughput"]))
    except Exception as e:
        print(f"[Plot] Error reading CSV: {e}. Skipping plot.")
        return

    if not cycles:
        print("[Plot] No data rows found in CSV. Skipping plot.")
        return

    output_dir = os.path.dirname(os.path.abspath(filename))

    # Plot Average Waiting Time
    plt.figure()
    plt.plot(cycles, avg_wait, color='red')
    plt.title("Average Waiting Time per Cycle")
    plt.xlabel("Cycle")
    plt.ylabel("Average Waiting Time (s)")
    plt.tight_layout()
    wait_path = os.path.join(output_dir, "avg_wait_plot.png")
    plt.savefig(wait_path)
    plt.close()
    print(f"[Plot] Saved: {wait_path}")

    # Plot Throughput
    plt.figure()
    plt.plot(cycles, throughput, color='green')
    plt.title("Throughput per Cycle")
    plt.xlabel("Cycle")
    plt.ylabel("Vehicles Passed")
    plt.tight_layout()
    thru_path = os.path.join(output_dir, "throughput_plot.png")
    plt.savefig(thru_path)
    plt.close()
    print(f"[Plot] Saved: {thru_path}")
