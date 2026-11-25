module.exports = {
  apps: [
    {
      name: 'tjrentcar-api',
      script: './apps/api/dist/server.js',
      cwd: '/var/www/tjrentcar',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/tjrentcar-api-error.log',
      out_file: '/var/log/pm2/tjrentcar-api-out.log',
    },
    {
      name: 'tjrentcar-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/tjrentcar/apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/tjrentcar-web-error.log',
      out_file: '/var/log/pm2/tjrentcar-web-out.log',
    },
  ],
};
