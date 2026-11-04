package com.contractradar.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.common.BizException;
import com.contractradar.entity.ContractTemplate;
import com.contractradar.mapper.ContractTemplateMapper;
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
@RequestMapping("/api/admin/templates")
public class AdminTemplateController {

    private final ContractTemplateMapper templateMapper;

    public AdminTemplateController(ContractTemplateMapper templateMapper) {
        this.templateMapper = templateMapper;
    }

    @GetMapping
    public ApiResponse<List<ContractTemplate>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<ContractTemplate> query = Wrappers.lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(ContractTemplate::getName, keyword)
                    .or().like(ContractTemplate::getCategory, keyword));
        }
        query.orderByDesc(ContractTemplate::getUpdatedAt);
        return ApiResponse.ok(templateMapper.selectList(query));
    }

    @PostMapping
    public ApiResponse<ContractTemplate> create(@RequestBody ContractTemplate body) {
        body.setId(null);
        if (body.getStatus() == null) {
            body.setStatus(1);
        }
        body.setUpdatedAt(LocalDateTime.now());
        templateMapper.insert(body);
        return ApiResponse.ok(body);
    }

    @PutMapping("/{id}")
    public ApiResponse<ContractTemplate> update(@PathVariable Long id, @RequestBody ContractTemplate body) {
        ContractTemplate existing = templateMapper.selectById(id);
        if (existing == null) {
            throw new BizException("合同模板不存在");
        }
        body.setId(id);
        if (body.getStatus() == null) {
            body.setStatus(existing.getStatus());
        }
        body.setUpdatedAt(LocalDateTime.now());
        templateMapper.updateById(body);
        return ApiResponse.ok(templateMapper.selectById(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        templateMapper.deleteById(id);
        return ApiResponse.ok(null);
    }
}