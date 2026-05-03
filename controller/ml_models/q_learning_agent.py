# Implement Q-Learning Traffic Agent

import os
import random
import numpy as np
import pickle

# FIX #10: Use absolute path so Q-table is always saved/loaded from the same location
# regardless of where Python is launched from
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "q_table.pkl")

class QLearningAgent:

    def __init__(self):
        self.q_table = {}
        self.alpha = 0.1    # Learning rate
        self.gamma = 0.9    # Discount factor
        self.epsilon = 0.2  # Exploration rate (20% random, 80% greedy)

    def discretize(self, vehicle_counts):
        state = []
        for count in vehicle_counts.values():
            if count < 5:
                state.append(0)   # Low traffic
            elif count < 15:
                state.append(1)   # Medium traffic
            else:
                state.append(2)   # High traffic
        return tuple(state)

    def choose_action(self, state):
        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, 3)  # Explore randomly

        if state not in self.q_table:
            self.q_table[state] = np.zeros(4)

        return int(np.argmax(self.q_table[state]))  # Exploit best known action

    def update(self, state, action, reward, next_state):
        if state not in self.q_table:
            self.q_table[state] = np.zeros(4)

        if next_state not in self.q_table:
            self.q_table[next_state] = np.zeros(4)

        best_next = np.max(self.q_table[next_state])

        # Bellman equation
        self.q_table[state][action] += self.alpha * (
            reward +
            self.gamma * best_next -
            self.q_table[state][action]
        )

        # FIX #9: Epsilon decay — agent explores less as it gains experience
        # Floor at 0.05 so it never stops exploring completely
        self.epsilon = max(0.05, self.epsilon * 0.999)

    def save_model(self, filename=MODEL_PATH):
        with open(filename, "wb") as f:
            pickle.dump(self.q_table, f)
        print(f"[Q-Table] Saved to {filename} ({len(self.q_table)} states learned)")

    def load_model(self, filename=MODEL_PATH):
        try:
            with open(filename, "rb") as f:
                self.q_table = pickle.load(f)
            print(f"[Q-Table] Loaded from {filename} ({len(self.q_table)} states)")
        except FileNotFoundError:
            print("[Q-Table] No saved Q-Table found. Starting fresh.")