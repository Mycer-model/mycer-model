import numpy as np
import pandas as pd

def normalize(series):
    return (series - series.min()) / (series.max() - series.min())

def compute_vulnerability(gini, depend):
    x = gini * depend
    v_norm = normalize(x)
    return v_norm

def compute_mycer(core, rsf, v_norm):
    return core * rsf * np.exp(-v_norm)

def calculate_mycer(df):
    df["v_norm"] = compute_vulnerability(df["gini"], df["depend"])
    df["MYCER"] = compute_mycer(df["core"], df["rsf"], df["v_norm"])
    return df
