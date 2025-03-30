package com.pharma.pdms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

/**
 * Database configuration class implementing the Singleton pattern
 * This ensures that only one instance of the DataSource is created,
 * improving application performance and resource management
 */
@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;
    
    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;
    
    // Singleton instance holder
    private static class DataSourceHolder {
        private static DataSource INSTANCE = null;
    }
    
    /**
     * Creates a DataSource bean as a singleton using Spring's bean management
     * Spring ensures that this bean will be a singleton within the application context
     */
    @Bean
    public DataSource dataSource() {
        // Check if we already have an instance
        if (DataSourceHolder.INSTANCE == null) {
            synchronized (DatabaseConfig.class) {
                if (DataSourceHolder.INSTANCE == null) {
                    DriverManagerDataSource dataSource = new DriverManagerDataSource();
                    dataSource.setUrl(databaseUrl);
                    dataSource.setDriverClassName(driverClassName);
                    
                    // Store the reference to our singleton
                    DataSourceHolder.INSTANCE = dataSource;
                    
                    System.out.println("Created new database connection pool as a singleton");
                }
            }
        }
        
        return DataSourceHolder.INSTANCE;
    }
    
    /**
     * Gets the singleton DataSource instance directly (rarely needed outside Spring context)
     */
    public static DataSource getInstance() {
        if (DataSourceHolder.INSTANCE == null) {
            throw new IllegalStateException("DataSource has not been initialized yet");
        }
        return DataSourceHolder.INSTANCE;
    }
}