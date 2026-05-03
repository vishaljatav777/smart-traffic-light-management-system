MIN_GREEN = 8
MAX_GREEN = 40
YELLOW_TIME = 4
DATA_SOURCE = "MOCK"  # Options: "SUMO", "CCTV", "VIDEO", "MOCK"
STARVATION_THRESHOLD = 3

DIRECTIONS = ["N_J1", "E_J1", "S_J1", "W_J1"]
TLS_ID = "J1"

# For VIDEO mode, these will be populated with absolute paths
VIDEO_PATHS = {
    "N_J1": None,
    "E_J1": None,
    "S_J1": None,
    "W_J1": None
}

def get_lane_id(direction):
    """Map config direction name to SUMO edge ID (incoming)."""
    return direction # e.g. "N_J1"
