# Implement Q-Learning Traffic Agent

import random
import numpy as np
import pickle

class QLearningAgent:

    def __init__(self):
        self.q_table = {}
        self.alpha = 0.1
        self.gamma = 0.9
        self.epsilon = 0.2

    def discretize(self, vehicle_counts):
        state = []
        for count in vehicle_counts.values():
            if count < 5:
                state.append(0)
            elif count < 15:
                state.append(1)
            else:
                state.append(2)
        return tuple(state)

    def choose_action(self, state):
        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, 3)

        if state not in self.q_table:
            self.q_table[state] = np.zeros(4)

        return np.argmax(self.q_table[state])

    def update(self, state, action, reward, next_state):
        if state not in self.q_table:
            self.q_table[state] = np.zeros(4)

        if next_state not in self.q_table:
            self.q_table[next_state] = np.zeros(4)

        best_next = np.max(self.q_table[next_state])

        self.q_table[state][action] += self.alpha * (
            reward +
            self.gamma * best_next -
            self.q_table[state][action]
        )
    
    def save_model(self, filename="q_table.pkl"):
        with open(filename, "wb") as f:
            pickle.dump(self.q_table, f)

    def load_model(self, filename="q_table.pkl"):
        try:
            with open(filename, "rb") as f:
                self.q_table = pickle.load(f)
            print("✅ Q-Table Loaded")
        except FileNotFoundError:
            print("⚠ No saved Q-Table found. Starting fresh.")