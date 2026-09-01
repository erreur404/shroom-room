module.exports = {
  apps: [
    {
      name: 'shroom-room',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      time: true,
      max_memory_restart: '300M'
    }
  ]
};
