package com.contractradar.dto;

import java.util.List;

public record StatsResponse(
        long userCount,
        long templateCount,
        long riskRuleCount,
        long lawCount,
        long analysisCount,
        long feedbackCount,
        List<NameValue> riskDistribution,
        List<NameValue> dailyAnalyses
) {
}