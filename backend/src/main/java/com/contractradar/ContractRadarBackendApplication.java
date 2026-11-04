package com.contractradar;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.contractradar.mapper")
public class ContractRadarBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContractRadarBackendApplication.class, args);
    }
}