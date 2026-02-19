import matplotlib.pyplot as plt
import csv

def plot_metrics(filename="traffic_metrics.csv"):

    cycles = []
    avg_wait = []
    throughput = []

    with open(filename, mode='r') as file:
        reader = csv.DictReader(file)

        for row in reader:
            cycles.append(int(row["Cycle"]))
            avg_wait.append(float(row["Average_Waiting_Time"]))
            throughput.append(int(row["Throughput"]))

    # Plot Average Waiting Time
    plt.figure()
    plt.plot(cycles, avg_wait)
    plt.title("Average Waiting Time per Cycle")
    plt.xlabel("Cycle")
    plt.ylabel("Average Waiting Time (s)")
    plt.show()

    # Plot Throughput
    plt.figure()
    plt.plot(cycles, throughput)
    plt.title("Throughput per Cycle")
    plt.xlabel("Cycle")
    plt.ylabel("Vehicles Passed")
    plt.show()
