module.exports = {
  apps: [
    {
      name: 'equiprofile',
      script: 'dist/index.js',
      // For low-memory VPS (< 4GB RAM): use instances: 1
      // For higher-memory VPS (>= 4GB RAM): use instances: 2
      instances: 1,  // Changed to 1 for low-memory deployment
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      // Restart if memory exceeds 500MB (conservative for low-memory VPS)
      max_memory_restart: '500M',  // Changed from 1G
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/equiprofile/error.log',
      out_file: '/var/log/equiprofile/out.log',
      log_file: '/var/log/equiprofile/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
