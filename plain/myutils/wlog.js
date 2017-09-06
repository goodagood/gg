var winston = require('winston');

//winston.log('info', 'Hello distributed log files!');
//winston.info('Hello again distributed logs');

//By default, only the Console transport is set on the default logger. You can add or remove transports via the add() and remove() methods:

//winston.add(winston.transports.File, { filename: '/tmp/winston.log' });
//winston.remove(winston.transports.Console);

function add_log_file(full_file_path){
    //console.log('typeof full_file_path');
    //console.log(typeof full_file_path);
    if (typeof full_file_path === 'undefined') full_file_path = '/tmp/winston.log';
    if ( ! full_file_path ) full_file_path = '/tmp/winston.log';

    winston.add(winston.transports.File, { filename: full_file_path });
}

add_log_file();

module.exports.winston = winston;
module.exports.add_log_file = add_log_file;


if (require.main === module){
    //add_log_file();
    winston.log('info', 'ssss!', Date());
    winston.info('Hello sss again distributed logs');
}
