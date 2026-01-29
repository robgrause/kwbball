/*********************************************************************************
	IndexdDB Methods


********************************************************************************/
var gptindb =
   {
   db_version : 1.00,
   db_name : 'kwbballdb',
   dbobj_key_name: 'kwbballdb_key',
   dbobj_key_property: 'f_key',
   
   dbobj_login : 'kwbballdb_login',
  
   dbobj_system : 'kwbballdb_system',
   dbobj_startup : 'kwbballdb_startup',
  
   dbobj_session : 'kwbballdb_session',
   dbobj_sessionsubmitted : 'kwbballdb_sessionsubmitted',
   
   openDB:async function()
      {
       return new Promise((resolve, reject) => 
	 {
	 const request = indexedDB.open(gptindb.db_name, gptindb.db_version);

	 request.onupgradeneeded = async function(event) 
	    {
	    const db = event.target.result;
	
	    var os = await db.createObjectStore(gptindb.dbobj_login, {'keyPath': gptindb.dbobj_key_property});
	    var os = await db.createObjectStore(gptindb.dbobj_session, {'keyPath': 'f_id'});
	    var os = await db.createObjectStore(gptindb.dbobj_sessionsubmitted, {'keyPath': 'f_id'});
	    var os = await db.createObjectStore(gptindb.dbobj_system, {'keyPath': gptindb.dbobj_key_property});
   	    var os = await db.createObjectStore(gptindb.dbobj_startup, {'keyPath': gptindb.dbobj_key_property});
  
	    //resolve(event.target.result)
	    }
	 request.onsuccess = function(event)
	    {
	    // Database opened successfully
	    resolve(event.target.result)
	    }
	 request.onerror = function(event) 
	    {
	    // Error occurred while opening the database
	    console.log(event.target.errorCode);
	    reject(null);
	    }
	 });
      },

   writeToDB:async function(objStore,data,key)
      {
      const db = await gptindb.openDB()

      if(db == null)
	 return;

      var transaction = db.transaction(objStore, 'readwrite');
      var objectStore = transaction.objectStore(objStore);
      
      if (key == null)
	 {
	 var key = gptindb.dbobj_key_name;

	 data[gptindb.dbobj_key_property] = key;
	 }

      var request = await objectStore.put(data);

      request.onsuccess = function(event) 
	 {
	 return(data)
	 // Data added successfully
	 };
      request.onerror = function(event) 
	 {
	 console.log(event.target.errorCode);
	 return(data);
	 };
      },
   readFromDB:async function(objStore,key)
      {
      const db = await gptindb.openDB()

      if (key == undefined)
	 key = gptindb.dbobj_key_name;

      return new Promise((resolve, reject) => 
	 {
	 if(db == null)
	    reject(null)

	 var transaction = db.transaction(objStore, 'readwrite');
	 var objectStore = transaction.objectStore(objStore);

	 if (key == null)
	    key = gptindb.dbobj_key_name;

	 var request = objectStore.get(key);

	 var result = null;
	 request.onsuccess = function(event) 
	    {
	    result = event.target.result;

	    resolve(result)
	    };
	 request.onerror = function(event) 
	    {
	    console.log(event.target.errorCode);
	    reject(null)
	    };
	 });
      },

   readAllFromDB:async function(objStore)
      {
      const db = await gptindb.openDB()
      
      return new Promise((resolve, reject) => 
	 {
	 if(db == null)
	    reject(null)

	 var transaction = db.transaction(objStore, 'readwrite');
	 var objectStore = transaction.objectStore(objStore);

	 if (key == null)
	    var key = gptindb.dbobj_key_name;

	 var request = objectStore.getAll();

	 var result = null;
	 request.onsuccess = function(event) 
	    {
	    result = event.target.result;
	    resolve(result)
	    };
	 request.onerror = function(event) 
	    {
	    reject(null)
	    };
	 });
      },
      
  deleteFromDB:async function(objStore,key)
      {
      const db = await gptindb.openDB()
      
      if (key == undefined)
	 key = gptindb.dbobj_key_name;

      return new Promise((resolve, reject) => 
	 {
	 if(db == null)
	    reject(null)

	 var transaction = db.transaction(objStore, 'readwrite');
	 var objectStore = transaction.objectStore(objStore);

	 var request = objectStore.delete(key);

	 var result = null;
	 request.onsuccess = function(event) 
	    {
	    result = event.target.result
	    resolve(result)
	    };
	 request.onerror = function(event) 
	    {
	    console.log(event.target.errorCode);
	    reject(null)
	    };
	 });
      },
};
if ((typeof (module) !== 'undefined') && (module.exports) ) 
	{
    module.exports = gptindb;
    };
