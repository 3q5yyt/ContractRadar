package com.contractradar.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.dto.FeedbackRequest;
import com.contractradar.entity.AnalysisRecord;
import com.contractradar.entity.ContractTemplate;
import com.contractradar.entity.Feedback;
import com.contractradar.entity.LawArticle;
import com.contractradar.mapper.AnalysisRecordMapper;
import com.contractradar.mapper.ContractTemplateMapper;
import com.contractradar.mapper.FeedbackMapper;
import com.contractradar.mapper.LawArticleMapper;
import jakarta.validation.Valid;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    private final ContractTemplateMapper templateMapper;
    private final LawArticleMapper lawArticleMapper;
    private final AnalysisRecordMapper analysisRecordMapper;
    private final FeedbackMapper feedbackMapper;

    public ClientController(ContractTemplateMapper templateMapper,
                            LawArticleMapper lawArticleMapper,
                            AnalysisRecordMapper analysisRecordMapper,
                            FeedbackMapper feedbackMapper) {
        this.templateMapper = templateMapper;
        this.lawArticleMapper = lawArticleMapper;
        this.analysisRecordMapper = analysisRecordMapper;
        this.feedbackMapper = feedbackMapper;
    }

    @GetMapping("/templates")
    public ApiResponse<List<ContractTemplate>> templates() {
        return ApiResponse.ok(templateMapper.selectList(
                Wrappers.<ContractTemplate>lambdaQuery()
                        .eq(ContractTemplate::getStatus, 1)
                        .orderByDesc(ContractTemplate::getUpdatedAt)));
    }

    @GetMapping("/laws")
    public ApiResponse<List<LawArticle>> laws(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<LawArticle> query = Wrappers.lambdaQuery();
        query.eq(LawArticle::getStatus, 1);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(LawArticle::getLawName, keyword)
                    .or().like(LawArticle::getArticleNo, keyword)
                    .or().like(LawArticle::getKeywords, keyword)
                    .or().like(LawArticle::getContent, keyword));
        }
        query.orderByAsc(LawArticle::getLawName).orderByAsc(LawArticle::getArticleNo);
        return ApiResponse.ok(lawArticleMapper.selectList(query));
    }

    @GetMapping("/analyses")
    public ApiResponse<List<AnalysisRecord>> analyses(@RequestParam(required = false) Long userId) {
        LambdaQueryWrapper<AnalysisRecord> query = Wrappers.lambdaQuery();
        if (userId != null) {
            query.eq(AnalysisRecord::getUserId, userId);
        }
        query.orderByDesc(AnalysisRecord::getCreatedAt).last("LIMIT 50");
        return ApiResponse.ok(analysisRecordMapper.selectList(query));
    }

    @PostMapping("/feedback")
    public ApiResponse<Feedback> feedback(@Valid @RequestBody FeedbackRequest request) {
        Feedback feedback = new Feedback();
        feedback.setAnalysisId(request.analysisId());
        feedback.setUserId(request.userId());
        feedback.setContent(request.content());
        feedback.setStatus(0);
        feedback.setCreatedAt(LocalDateTime.now());
        feedbackMapper.insert(feedback);
        return ApiResponse.ok(feedback);
    }
}