package com.contractradar.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.common.BizException;
import com.contractradar.entity.RiskRule;
import com.contractradar.mapper.RiskRuleMapper;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/risk-rules")
public class AdminRiskRuleController {

    private final RiskRuleMapper riskRuleMapper;

    public AdminRiskRuleController(RiskRuleMapper riskRuleMapper) {
        this.riskRuleMapper = riskRuleMapper;
    }

    @GetMapping
    public ApiResponse<List<RiskRule>> list(@RequestParam(required = false) String keyword,
                                            @RequestParam(required = false) String level) {
        LambdaQueryWrapper<RiskRule> query = Wrappers.lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(RiskRule::getRiskType, keyword)
                    .or().like(RiskRule::getKeywords, keyword));
        }
        if (StringUtils.hasText(level)) {
            query.eq(RiskRule::getLevel, level);
        }
        query.orderByDesc(RiskRule::getUpdatedAt);
        return ApiResponse.ok(riskRuleMapper.selectList(query));
    }

    @PostMapping
    public ApiResponse<RiskRule> create(@RequestBody RiskRule body) {
        body.setId(null);
        if (body.getStatus() == null) {
            body.setStatus(1);
        }
        body.setUpdatedAt(LocalDateTime.now());
        riskRuleMapper.insert(body);
        return ApiResponse.ok(body);
    }

    @PutMapping("/{id}")
    public ApiResponse<RiskRule> update(@PathVariable Long id, @RequestBody RiskRule body) {
        RiskRule existing = riskRuleMapper.selectById(id);
        if (existing == null) {
            throw new BizException("风险规则不存在");
        }
        body.setId(id);
        if (body.getStatus() == null) {
            body.setStatus(existing.getStatus());
        }
        body.setUpdatedAt(LocalDateTime.now());
        riskRuleMapper.updateById(body);
        return ApiResponse.ok(riskRuleMapper.selectById(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        riskRuleMapper.deleteById(id);
        return ApiResponse.ok(null);
    }
}