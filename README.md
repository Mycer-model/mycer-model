# MYCER Replication Package

This repository contains a dissertation-specific replication scaffold for the **MYCER (Mustafa Yüksel Çınar Energy Resilience Index)** framework.

It is aligned with the computational workflow described in the thesis:

1. Data acquisition and preprocessing  
2. Indicator normalization  
3. Data Fidelity Correction (DFC)  
4. Hybrid weight computation (AHP + entropy + SHAP-based γ)  
5. Regional Scaling Factor (RSF)  
6. Structural vulnerability calculation  
7. Final MYCER aggregation  
8. Sensitivity analysis  

## Repository structure

- `data/raw/` — original source files  
- `data/processed/` — cleaned and harmonized panel data  
- `scripts/01_preprocessing.py` — loading, cleaning, imputation, directionality adjustment  
- `scripts/02_dfc.py` — Data Fidelity Correction calculations  
- `scripts/03_weighting_ahp_entropy_shap.py` — AHP, entropy, and SHAP-based hybrid weights  
- `scripts/04_rsf.py` — Regional Scaling Factor computation  
- `scripts/05_vulnerability.py` — vulnerability interaction and exponential damping  
- `scripts/06_mycer_compute.py` — final MYCER score generation  
- `scripts/07_sensitivity.py` — Monte Carlo and weighting scenario analysis  
- `notebooks/MYCER_replication.ipynb` — notebook scaffold for end-to-end execution  
- `docs/methodology.md` — plain-language workflow summary  

## Expected input fields

The scaffold assumes a harmonized panel dataset with columns such as:

- `country`
- `year`
- `indicator`
- `value`
- `data_source`
- `missing_flag`

You can adapt this to your final dataset schema.

## Core formulas

### Normalization
`N(x_j) = (x_j - min(x_j)) / (max(x_j) - min(x_j))`

### RSF
`RSF_i = (Infra_i + Digital_i) / 2`

### Vulnerability
`x_i(t) = GINI_i * DEPEND_i(t)`  
`V_norm_i(t) = (x_i(t) - x_min) / (x_max - x_min)`

### Final aggregation
`MYCER_i(t) = Core_i(t) * RSF_i * exp(-V_norm_i(t))`

## Reproducibility note

This scaffold is intentionally conservative: it provides a clear, auditable structure first, then allows you to plug in the final cleaned data and dissertation-consistent parameters.

## Dissertation text

Suggested thesis sentence:

> A dedicated replication repository specific to this dissertation is maintained at the project GitHub repository. The repository contains the computational scripts used for preprocessing, weighting, RSF computation, vulnerability modulation, and MYCER score aggregation.
