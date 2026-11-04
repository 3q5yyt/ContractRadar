package com.contractradar.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.common.BizException;
import com.contractradar.dto.StatusRequest;
import com.contractradar.entity.AnalysisRecord;
import com.contractradar.entity.Feedback;
import com.contractradar.mapper.AnalysisRecordMapper;
import com.contractradar.mapper.FeedbackMapper;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminAnalysisController {

    private final AnalysisRecordMapper analysisRecordMapper;
    private final FeedbackMapper feedbackMapper;

    public AdminAnalysisController(AnalysisRecordMapper analysisRecordMapper,
                                   FeedbackMapper feedbackMapper) {
        this.analysisRecordMapper = analysisRecordMapper;
        this.feedbackMapper = feedbackMapper;
    }

    @GetMapping("/analyses")
    public ApiResponse<List<AnalysisRecord>> analyses(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<AnalysisRecord> query = Wrappers.lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(AnalysisRecord::getContractName, keyword)
                    .or().like(AnalysisRecord::getSummary, keyword));
        }
        query.orderByDesc(AnalysisRecord::getCreatedAt).last("LIMIT 200");
        return ApiResponse.ok(analysisRecordMapper.selectList(query));
    }

    @GetMapping("/analyses/{id}")
    public ApiResponse<AnalysisRecord> analysisDetail(@PathVariable Long id) {
        AnalysisRecord record = analysisRecordMapper.selectById(id);
        if (record == null) {
            throw new BizException("分析记录不存在");
        }
        return ApiResponse.ok(record);
    }

    @GetMapping("/feedback")
    public ApiResponse<List<Feedback>> feedback(@RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<Feedback> query = Wrappers.lambdaQuery();
        if (status != null) {
            query.eq(Feedback::getStatus, status);
        }
        query.orderByDesc(Feedback::getCreatedAt).last("LIMIT 200");
        return ApiResponse.ok(feedbackMapper.selectList(query));
    }

    @PutMapping("/feedback/{id}/status")
    public ApiResponse<Void> updateFeedbackStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        Feedback feedback = feedbackMapper.selectById(id);
        if (feedback == null) {
            throw new BizException("反馈不存在");
        }
        if (request.status() == null) {
            throw new BizException("状态值不能为空");
        }
        feedback.setStatus(request.status());
        feedbackMapper.updateById(feedback);
        return ApiResponse.ok(null);
    }
}