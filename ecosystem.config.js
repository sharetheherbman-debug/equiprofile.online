module.exports = {
  apps: [
    {
      name: 'equiprofile',
      script: 'dist/index.js',
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
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
      time: true,
    },
  ],
};
