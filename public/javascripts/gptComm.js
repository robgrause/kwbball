var gptcomm =
	{
	gblListParams : null,
	
	// Credentials are set in controller functions
	// Based on /sub-domain, thed creds are passed in *.pug startup views (i.e. Field and Admin)
	gblCredentials : null,
	
	apiCmdStack : [],

	apicmdStackUpdate:function(apiCmd,add)
		{
		if (add == true)
			{
			gptcomm.apiCmdStack.push(apiCmd)
			var timeout = modal.displaySpinner('modalSpinnerParent',true);
			
			if (timeout == true)
				{
				//modal.displayModalOpen ("WARNING", "System timedout. The server is not responding.",
				//					null,null,modal.modalParams.mode.modeOk,null);
				gptcomm.apicmdStackUpdate(apiCmd,false);
				
				return(true)
				}
			}
		else
			{
			for (var i = 0; i < gptcomm.apiCmdStack.length; i++)
				{
				if (gptcomm.apiCmdStack[i] == apiCmd)
					gptcomm.apiCmdStack.splice(i, 1);
				}
						
			if (gptcomm.apiCmdStack.length <= 0)
				modal.displaySpinner('modalSpinnerParent',false);
			}
		return(false)
		},
	
	processOfflineCmd:async function(apiCmd,dataCmd,callback)
		{
		var key = undefined;

		if (apiCmd == 'systemget')
			var objStore = gptindb.dbobj_system;
		else if (apiCmd == 'startup')
			{
			console.log('Reading from : ' + gptindb.dbobj_startup);
			var startup = await gptindb.readFromDB(gptindb.dbobj_startup,null);
			
			console.log('Reading from : ' + gptindb.dbobj_system);
			startup.f_system = await gptindb.readFromDB(gptindb.dbobj_system,null);
			
			if (callback)
				callback (startup,apiCmd)
				
			return;
			}
		else if (apiCmd == 'userget')
			var objStore = gptindb.dbobj_login;
		else if (apiCmd == 'checkversion')
			return;
		else
			{
			if (navigator.onLine != true)
				modal.displayModalOpen ("ERROR", "You are currently 'OFFLINE'.",
									null,null,modal.modalParams.mode.modeOk,null);
			else
				modal.displayModalOpen ("ERROR", "The server can not be reached.",
									null,null,modal.modalParams.mode.modeOk,null);
			return;
			}
		
		console.log('Reading from : ' + objStore);
		var obj = await gptindb.readFromDB(objStore,key)

		if (callback)
			callback (obj,apiCmd)
			
		return;
		},

	// Get List Object
	getObjList:async function (params, callback)
		{
		var apiCmd = 'GetObjects';
		var dataCmd = undefined;

		// offline
		if (navigator.onLine != true)
			{
			gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
			return;
			}
		
		var urlStr = defines.urlApiGetList();
		var data = { 'credentials':gptcomm.gblCredentials,'data':params };
	
		var reqHeader = new Headers();
		reqHeader.append('Content-Type','application/json');
		reqHeader.append('Accept','application/json');

		var initObject = {'method': 'POST', 'headers': reqHeader, 'body':JSON.stringify(data)};

		var userRequest = new Request(urlStr, initObject);
	
		try
			{
			if (gptcomm.apicmdStackUpdate(apiCmd,true) == true)
				{
				gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
				return;
				}
				
			const response= await fetch(userRequest)
		
			gptcomm.apicmdStackUpdate(apiCmd,false);
			
			if (response.ok != true)
				{
				if (response.status == 502)
					{
					gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
					return;
					}
				else
					throw new Error(`Response status: ${response.status}`);
				}
		
			const data = await response.json();
			var results = data.results;
			if ( (data.error == true) && (data.msg) )
				{
				var msg = data.msg;
				modal.displayModalOpen ("ERROR",msg,null, null,	modal.modalParams.mode.modeOk,null);
				results = null;
				}
			else if (results == undefined)
				{
					
				}
			else if (callback)
				callback (results,params);
			}
		catch(error)
			{
			console.log(error.message);
			
			gptcomm.apicmdStackUpdate('GetObjects',false);
			}
	},

	processServerApi:async function (apiCmd, dataCmd, callback)
		{
		// offline
		if (navigator.onLine != true)
			{
			gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
			return;
			}

		var urlStr = defines.urlApiGet() + "/" + apiCmd;
		var data = { 'credentials':gptcomm.gblCredentials,'apicmd':apiCmd,'data':dataCmd };

		var reqHeader = new Headers();
		reqHeader.append('Content-Type','application/json');
		reqHeader.append('Accept','application/json');

		var initObject = {'method': 'POST', 'headers': reqHeader, 'body':JSON.stringify(data)};

		var userRequest = new Request(urlStr, initObject);

		try
			{
			if (gptcomm.apicmdStackUpdate(apiCmd,true) == true)
				{
				gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
				return;
				}

			const response= await fetch(userRequest)

			gptcomm.apicmdStackUpdate(apiCmd,false);

			if (response.ok != true)
				{
				if (response.status == 502)
					{
					gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
					return;
					}
				else
					throw new Error(`Response status: ${response.status}`);
				}
		
			const data = await response.json();
			var results = data.results;
			if ( (data.error == true) && (data.msg) )
				{
				var msg = data.msg;
				modal.displayModalOpen ("ERROR",msg,null, null,	modal.modalParams.mode.modeOk,null);
				results = null;
				callback (results,apiCmd)
				}
			else if (results == undefined)
				{
					
				}
			else if (callback)
				callback (results,apiCmd)
			}
		catch(error)
			{
			console.log(error.message);
			
			gptcomm.apicmdStackUpdate(apiCmd,false);
			}
	},

	processServerUpload:async function (apiCmd, formData, progressdivId,progressbarId,callback)
		{
		// offline
		if (navigator.onLine != true)
			{
			gptcomm.processOfflineCmd(apiCmd,formData,callback)
			return;
			}
		
		var urlStr = defines.urlApiGet() + "/" + apiCmd;
		formData.append('credentials', JSON.stringify(gptcomm.gblCredentials));
	
		//var reqHeader = new Headers();
		//reqHeader.append('Content-Type','application/json');
		//reqHeader.append('Accept','application/json');
		//var initObject = {'method': 'POST', 'headers': reqHeader, 'body':formData};

		var initObject = {'method': 'POST', 'body':formData};

		var userRequest = new Request(urlStr, initObject);
		
		if (progressbarId)
			{
			gptut.setDivShowState(progressdivId,true,true);
		
			window.addEventListener('fetch-progress',function(e) 
				{
				console.log(e.detail)
				});
 
			window.addEventListener('fetch-finished', function(e)
				{
				console.log(e.detail);
				});
			}
		try
			{
			gptcomm.apicmdStackUpdate('Upload',true);
		
			const response= await fetch(userRequest)

			gptcomm.apicmdStackUpdate('Upload',false);
		
			if (response.ok != true)
				{
				if (response.status == 502)
					{
					//gptcomm.processOfflineCmd(apiCmd,dataCmd,callback)
					return;
					}
				else
					throw new Error(`Response status: ${response.status}`);
				}
		
			const data = await response.json();
			var results = data.results;
			if ( (data.error == true) && (data.msg) )
				{
				var msg = data.msg;
				modal.displayModalOpen ("ERROR",msg,null, null,	modal.modalParams.mode.modeOk,null);
				results = null;
				}
			else if (results == undefined)
				{
					
				}
			else if (callback)
				callback (results,apiCmd)
			}
		catch(error)
			{
			console.log(error.message);
			}
		},
	  
	processLocalDBUpload:async function()
		{
		if (navigator.onLine != true)
			return;
		
		const sessionlist = await gptindb.readAllFromDB(gptindb.dbobj_sessionsubmitted)
	 
		return new Promise((resolve, reject) => 
			{
			if (sessionlist.length <= 0)
				resolve(null)

			var reject = false;
			for (var i in sessionlist)
				{
				delete sessionlist[i].f_key;
				gptcomm.processServerApi('sessionupload', sessionlist[i], function(obj,apiCmd)
					{
					//error occurred - requeue
					if (obj == undefined)
						{
						reject = true;
						console.log('UPLOAD REJECTED, resubmitting upload request...')
						}
					else
						{
						console.log('DELETING: upload request...')
						gptindb.deleteFromDB(gptindb.dbobj_sessionsubmitted,sessionlist[i].f_id)
						}
					});
				}
	    
			if (reject == true)
				reject(null)
			else
				resolve(null)
			});
		},

};
if ((typeof (module) !== 'undefined') && (module.exports) ) 
	{
    module.exports = gptcomm;
    };
