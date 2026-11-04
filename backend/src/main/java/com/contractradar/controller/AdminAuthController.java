package com.contractradar.controller;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.contractradar.auth.JwtService;
import com.contractradar.common.ApiResponse;
import com.contractradar.common.BizException;
import com.contractradar.dto.LoginRequest;
import com.contractradar.dto.LoginResponse;
import com.contractradar.entity.AdminUser;
import com.contractradar.mapper.AdminUserMapper;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminAuthController(AdminUserMapper adminUserMapper,
                               PasswordEncoder passwordEncoder,
                               JwtService jwtService) {
        this.adminUserMapper = adminUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AdminUser admin = adminUserMapper.selectOne(
                Wrappers.<AdminUser>lambdaQuery().eq(AdminUser::getUsername, request.username()));
        if (admin == null || !passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new BizException("用户名或密码错误");
        }
        if (admin.getStatus() != null && admin.getStatus() == 0) {
            throw new BizException("账号已停用");
        }
        String token = jwtService.createToken(admin.getUsername(), admin.getRole());
        return ApiResponse.ok(new LoginResponse(token, admin.getName(), admin.getUsername()));
    }
}