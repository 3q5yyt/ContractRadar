package com.contractradar.controller;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.dto.NameValue;
import com.contractradar.dto.StatsResponse;
import com.contractradar.entity.AnalysisRecord;
import com.contractradar.entity.RiskRule;
import com.contractradar.mapper.AnalysisRecordMapper;
import com.contractradar.mapper.AppUserMapper;
import com.contractradar.mapper.ContractTemplateMapper;
import com.contractradar.mapper.FeedbackMapper;
import com.contractradar.mapper.LawArticleMapper;
import com.contractradar.mapper.RiskRuleMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final AppUserMapper appUserMapper;
    private final ContractTemplateMapper templateMapper;
    private final RiskRuleMapper riskRuleMapper;
    private final LawArticleMapper lawArticleMapper;
    private final AnalysisRecordMapper analysisRecordMapper;
    private final FeedbackMapper feedbackMapper;

    public AdminStatsController(AppUserMapper appUserMapper,
                                ContractTemplateMapper templateMapper,
                                RiskRuleMapper riskRuleMapper,
                                LawArticleMapper lawArticleMapper,
                                AnalysisRecordMapper analysisRecordMapper,
                                FeedbackMapper feedbackMapper) {
        this.appUserMapper = appUserMapper;
        this.templateMapper = templateMapper;
        this.riskRuleMapper = riskRuleMapper;
        this.lawArticleMapper = lawArticleMapper;
        this.analysisRecordMapper = analysisRecordMapper;
        this.feedbackMapper = feedbackMapper;
    }

    @GetMapping
    public ApiResponse<StatsResponse> stats() {
        long userCount = appUserMapper.selectCount(null);
        long templateCount = templateMapper.selectCount(null);
        long riskRuleCount = riskRuleMapper.selectCount(null);
        long lawCount = lawArticleMapper.selectCount(null);
        long analysisCount = analysisRecordMapper.selectCount(null);
        long feedbackCount = feedbackMapper.selectCount(null);

        long high = riskRuleMapper.selectCount(
                Wrappers.<RiskRule>lambdaQuery().eq(RiskRule::getLevel, "high"));
        long medium = riskRuleMapper.selectCount(
                Wrappers.<RiskRule>lambdaQuery().eq(RiskRule::getLevel, "medium"));
        long low = riskRuleMapper.selectCount(
                Wrappers.<RiskRule>lambdaQuery().eq(RiskRule::getLevel, "low"));

        List<NameValue> riskDistribution = new ArrayList<>();
        riskDistribution.add(new NameValue("高风险", high));
        riskDistribution.add(new NameValue("中风险", medium));
        riskDistribution.add(new NameValue("低风险", low));

        LocalDate start = LocalDate.now().minusDays(6);
        List<AnalysisRecord> records = analysisRecordMapper.selectList(
                Wrappers.<AnalysisRecord>lambdaQuery()
                        .ge(AnalysisRecord::getCreatedAt, start.atStartOfDay())
                        .orderByAsc(AnalysisRecord::getCreatedAt));
        Map<String, Long> dailyMap = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            dailyMap.put(start.plusDays(i).toString(), 0L);
        }
        for (AnalysisRecord record : records) {
            if (record.getCreatedAt() != null) {
                String key = record.getCreatedAt().toLocalDate().toString();
                dailyMap.put(key, dailyMap.getOrDefault(key, 0L) + 1);
            }
        }
        List<NameValue> dailyAnalyses = new ArrayList<>();
        for (Map.Entry<String, Long> entry : dailyMap.entrySet()) {
            dailyAnalyses.add(new NameValue(entry.getKey(), entry.getValue()));
        }

        return ApiResponse.ok(new StatsResponse(
                userCount, templateCount, riskRuleCount, lawCount,
                analysisCount, feedbackCount, riskDistribution, dailyAnalyses));
    }
}