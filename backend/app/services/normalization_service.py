from typing import Dict, Any, Tuple
from backend.app.core.config import settings

EXCHANGE_RATES = {
    "INR": 1.0,
    "USD": settings.USD_TO_INR_RATE,
    "EUR": settings.EUR_TO_INR_RATE,
    "GBP": settings.GBP_TO_INR_RATE,
}

class NormalizationService:
    @staticmethod
    def normalize_salary(
        amount: float,
        currency: str = "INR",
        period: str = "annual"
    ) -> Dict[str, Any]:
        """
        Normalizes salary into an annualized INR figure while strictly preserving
        the original inputs and recording all conversion assumptions.
        """
        curr = (currency or "INR").upper().strip()
        comp_period = (period or "annual").lower().strip()
        
        # 1. Period normalization
        if comp_period in ["monthly", "month", "mo"]:
            annual_in_original_curr = amount * 12.0
            period_multiplier = 12.0
        elif comp_period in ["hourly", "hour", "hr"]:
            # Standard 2,000 working hours/year assumption
            annual_in_original_curr = amount * 2000.0
            period_multiplier = 2000.0
        else:
            annual_in_original_curr = amount
            period_multiplier = 1.0

        # 2. Currency normalization
        rate = EXCHANGE_RATES.get(curr, 1.0)
        is_currency_converted = (curr != "INR")
        
        normalized_annual_inr = round(annual_in_original_curr * rate, 2)
        
        return {
            "original_salary": amount,
            "original_currency": curr,
            "compensation_period": comp_period,
            "normalized_annual_salary": normalized_annual_inr,
            "normalized_currency": "INR",
            "exchange_rate_applied": rate,
            "is_estimated_conversion": is_currency_converted or (comp_period != "annual"),
            "conversion_notes": f"Converted {curr} {amount:,.0f} ({comp_period}) to annualized INR using rate {rate}" if is_currency_converted or comp_period != "annual" else "Direct annual INR"
        }

    @staticmethod
    def format_inr(amount: float, format_type: str = "standard") -> str:
        """
        Formats INR numbers in standard Indian numbering (e.g. Lakhs / LPA).
        """
        if amount is None:
            return "₹0"
        
        if format_type == "lpa":
            lakhs = amount / 100000.0
            return f"₹{lakhs:.2f} LPA"
        
        # Standard Indian comma grouping
        s = f"{int(round(amount))}"
        if len(s) <= 3:
            return f"₹{s}"
        last_three = s[-3:]
        remaining = s[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        return f"₹{','.join(groups)},{last_three}"
