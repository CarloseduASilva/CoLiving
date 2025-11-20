try {
    console.log('Requiring group.controller...');
    require('./src/controllers/group.controller');
    console.log('Requiring expense.controller...');
    require('./src/controllers/expense.controller');
    console.log('Requiring group.routes...');
    require('./src/routes/group.routes');
    console.log('Success!');
} catch (e) {
    console.error('Error:', e);
}
