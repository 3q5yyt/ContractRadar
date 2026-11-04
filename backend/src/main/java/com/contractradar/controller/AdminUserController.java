package com.contractradar.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.common.ApiResponse;
import com.contractradar.common.BizException;
import com.contractradar.dto.StatusRequest;
import com.contractradar.entity.AppUser;
import com.contractradar.mapper.AppUserMapper;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AppUserMapper appUserMapper;

    public AdminUserController(AppUserMapper appUserMapper) {
        this.appUserMapper = appUserMapper;
    }

    @GetMapping
    public ApiResponse<List<AppUser>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<AppUser> query = Wrappers.lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(AppUser::getUsername, keyword)
                    .or().like(AppUser::getNickname, keyword)
                    .or().like(AppUser::getPhone, keyword));
        }
        query.orderByDesc(AppUser::getCreatedAt);
        return ApiResponse.ok(appUserMapper.selectList(query));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        AppUser user = appUserMapper.selectById(id);
        if (user == null) {
            throw new BizException("用户不存在");
        }
        if (request.status() == null || (request.status() != 0 && request.status() != 1)) {
            throw new BizException("状态值不合法");
        }
        user.setStatus(request.status());
        appUserMapper.updateById(user);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        appUserMapper.deleteById(id);
        return ApiResponse.ok(null);
    }
}