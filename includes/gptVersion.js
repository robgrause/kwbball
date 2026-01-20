/*********************************************************************************
	Version Data


********************************************************************************/
var version =
	{
	version : 'v1.13',
	client_cache :'kwbball',

	site:function () {return('greenpasturetech.com') },
	
	client_subdomain:function () { return('kwbball.' + version.site())},
	client_subdomain_address:function(){return('https://' + version.client_subdomain() + '/')},
	
	urlKWBBALL:function () {return("https://" + version.client_subdomain() + "/")},
	};

if ((typeof (module) !== 'undefined') && (module.exports) ) 
	{
    module.exports = version;
    };
