module.exports = {
    apps: [
        {
            name: 'prehire-backend',
            script: './backend/src/server.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'development',
                BACKEND_PORT: 5001
            },
            env_production: {
                NODE_ENV: 'production',
                BACKEND_PORT: 5001
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true
        },
        {
            name: 'prehire-ai-service',
            script: './ai-service/server.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'development',
                PORT: 3001
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            error_file: './logs/ai-service-error.log',
            out_file: './logs/ai-service-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true
        }
    ]
};
