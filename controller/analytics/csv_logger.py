import csv
import os

class CSVLogger:

    def __init__(self, filename="traffic_metrics.csv"):
        self.filename = filename
        self.file_exists = os.path.isfile(self.filename)

        with open(self.filename, mode='a', newline='') as file:
            writer = csv.writer(file)

            if not self.file_exists:
                writer.writerow([
                    "Cycle",
                    "Active_Side",
                    "Green_Time",
                    "Yellow_Time",
                    "Average_Waiting_Time",
                    "Throughput"
                ])

    def log(self, cycle, active_side, green_time, yellow_time,
            avg_wait, throughput):

        with open(self.filename, mode='a', newline='') as file:
            writer = csv.writer(file)

            writer.writerow([
                cycle,
                active_side,
                green_time,
                yellow_time,
                round(avg_wait, 2),
                throughput
            ])
