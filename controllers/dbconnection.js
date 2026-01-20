const mysql = require ('mysql');
const util = require ('util');

const host = 'localhost';
const user = 'kwbball';  // NOTE: root login is 'kwbball'
const password = 'kwbball';
const database = 'kwbballdb';
const socket = '/run/mysqld/mysqld.sock'

/*
	pool : mysql.createPool ({
				connectionLimit : 12,
				host: host,
				user: user,
				password: password,
				database: database
		}),
*/
	function execute (creds,sql,args,callback)
		{
		//----------------------------------------------------------------
		// NOTE: 	There is a problem with connection pooling.
		//
		// ERROR:	Gives error 'ER_NO_DB_ERROR' - 'No database selected'
		//
		//----------------------------------------------------------------
		var useDb = database;

		if ( (creds !=  undefined) && (creds.f_database_name.length > 0) )
			useDb = creds.f_database_name;
		
		const dbconn = mysql.createConnection ({
				user: user,
				password: password,
				database: useDb,
				socketPath : socket
				});
		dbconn.connect(function (err)
			{
			if (err)
				console.log (err);
			else
				{
				var err = null;
				try {
					dbconn.query (sql, args, function(err,results)
						{
						if (err) 
							{
							if (err.errno == 1062)
								{
								var errmsg = 
									{	
									errno : 1062,
									msg : "DUPLICATE: record for item already exits."
									}
								}
							console.log(err)
							err = errmsg;
							}

						callback(err,results);
						})
					}
				
				catch (e){err = e;}
				finally
					{
					dbconn.end();

					return; //throw (err);
					}
				}
			});
		};
				
	async function executeAsync(creds,sql,args)
		{
		var useDb = ''; //database;
		
		if ( (creds !=  undefined) && (creds.f_database_name.length > 0) )
			useDb = creds.f_database_name;
			
		const dbconn = mysql.createConnection ({
				user: user,
				password: password,
				database: useDb,
				socketPath : socket
				});

		var results = 	{
						err : false,
						error : '',
						results : null
						};
		var dbresults= null;
		var err = '';
		
		const query = util.promisify (dbconn.query).bind(dbconn);
		
		try {dbresults = await query (sql,args);}
		catch (e){err = e;}
		finally 
			{
			dbconn.end();

			if (err)
				{
				if (err.errno == 1062)
					{
					var errmsg = 
						{	
						errno : 1062,
						msg : "DUPLICATE: record for item already exits."
						}
					err = errmsg;
					}
					
				results.err = true;
				results.error = err;
				results.results = null;
				}
			else
				{
				results.err = false;
				results.error = '';
				results.results = dbresults;
				}
			return(results);
			}
		};
module.exports={execute,executeAsync};
