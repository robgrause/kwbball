
var gptut = 
	{
	os_mac : 'Mac OS',
	os_ios : 'iOS',
	os_windows : 'Windows',
	os_android : 'Android',
	os_linux : 'Linux',
	
	copyObject:function(obj)
		{
		return(JSON.parse(JSON.stringify(obj)))
		},
	getOS:function() 
		{
		var userAgent = window.navigator.userAgent;
		var platform = window.navigator.platform;
		var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
		var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
		var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
		var os = null;

		if (macosPlatforms.indexOf(platform) !== -1)
			os = gptut.os_mac;
		else if (iosPlatforms.indexOf(platform) !== -1)
			os = gptut.os_ios;
		else if (windowsPlatforms.indexOf(platform) !== -1) 
			os = gptut.os_windows;
		else if (/Android/.test(userAgent))
			os =gptut.os_android;
		else if (!os && /Linux/.test(platform))
			os = gptut.os_linux;

		return (os);
		},
	
	uppercaseFirstLetter:function(str)
		{
		var words = str.toLowerCase().split(' ');
		
		for (var i = 0; i < words.length; i++) 
			{
			words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
			}
		return words.join(' ');
		},
	capitalize:function(str)
		{
		return str[0].toUpperCase() + str.slice(1);
		},
	
	getWeekNumOfYear:function(date)
		{
        var onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
		},

	getChildWithClass:function(parentId,classname)
		{
		var parent = document.getElementById(parentId);
		
		for (var i = 0; i < parent.childNodes.length; i++) 
			{
			if (parent.childNodes[i].classList.contains(classname) == true)
				return(parent.childNodes[i])
			}
				
		return(null);
		},
		
	getElementRelativeWithClass:function(elem,idClass)
		{
		if (elem == null)
			return(null);

		classlist = elem.classList;
		
		if ( (classlist != undefined) && (classlist.contains(idClass) == true) )
			return(elem);

		if (elem.parentNode)
			return(gptut.getElementRelativeWithClass(elem.parentNode,idClass));
		else
			return(null);
		},

	deleteElementChildren:function(id)
		{
		var elem = document.getElementById(id);

		if (elem)
			while (elem.hasChildNodes())
				elem.removeChild(elem.lastChild);
		},
	
	deleteElement:function(id)
		{
		var elem = document.getElementById (id);
		
		if (elem)
			elem.parentNode.removeChild(elem);
		},
		
	replaceElement:function(id, newdiv, parent)
		{
		if (parent.id == id)
			parent.parentNode.replaceChild(newdiv,parent);
		else
			{
			for (var i = 0; i < parent.childNodes.length; i++)
				{
				var child = parent.childNodes[i];
				if (child.id == id)
					child.parentNode.replaceChild(newdiv,child);
				else
					gptut.replaceElement(id, newdiv, child);
				}
			} 
		},
	
	setElemFieldValueById:function (value, fieldId, elemId)
		{
		var elem = document.getElementById(elemId);	
		
		elem.setAttributeNS(null, fieldId, value);
		},
		
	getElemFieldValueById:function (fieldId, elemId)
		{
		var elem = document.getElementById(elemId);	

		return (elem.getAttribute(fieldId));
		},	
/*
	setOpacity:function(ctrlId, grayout)
		{
		var elem = document.getElementById(ctrlId);	
		
		if (elem == undefined)
			return;
			
		var opacity = 1.0;
		
		if (grayout == true)
			opacity = 0.40;
			
		elem.style.opacity = opacity;
		},
*/
	setDisabledState:function(ctrlId, disabled)
		{
		if ($('#' + ctrlId).length <= 0)
			return;
			
		var $elem = $('#' + ctrlId);
	
		if (disabled == true)
			{
			$elem.addClass('aDisabled');
			$elem.prop('disabled', true);
			}
		else
			{
			$elem.removeClass('aDisabled');
			$elem.prop('disabled', false);
			}
		},

	toggleShowState:function(ctrlId)
		{
		var elem = document.getElementById(ctrlId);
		if (elem.style.display === "none")
			elem.style.display = "block";
		else
			elem.style.display = "none";
		},
		
	setShowState:function(ctrlId, show)
		{
		if ($('#' + ctrlId).length <= 0)
			return;
			
		if (show)
			{
			$('#' + ctrlId).show();
			$('#' + ctrlId).removeClass('hide');
			}
		else
			{
			$('#' + ctrlId).hide();
			}
		},
/*		
	setDivShowStateToDefault:function(divId)
		{
		if ($('#' + divId).length <= 0)
			return;
		
		$('#' + divId).find('*').css('display', 'initial');
		},
*/
	setDivShowState:function(divId, show, includeDiv)
		{
		if ($('#' + divId).length <= 0)
			return;

		if (show)
			{
			$('#' + divId).children().show();
			$('#' + divId).find().removeClass('hide');
			if ( (includeDiv == null) || (includeDiv == true) )
				{
				$('#' + divId).show();
				$('#' + divId).removeClass('hide');
				}
			}
		else
			{
			$('#' + divId).children().hide();
			if ( (includeDiv == null) || (includeDiv == true) )
				$('#' + divId).hide();
			}
		},

	removeClassAllElements:function (idClass)
		{
		$('.' + idClass).removeClass(idClass);
		},
	deleteElementsByClass:function (idClass)
		{
		var pts = document.getElementsByClassName(idClass);

		if ( (pts == null) || (pts.length <= 0) )
			return;
			
		// this doesn't process all elems - so use recursion until gone
		for (var i = 0; i < pts.length; i++) 
			pts[i].parentNode.removeChild(pts[i]);
			
		// test to see if still exist
		pts = [];
		pts = document.getElementsByClassName(idClass);
		if (pts.length > 0)
			gptut.deleteElementsByClass(idClass);
		},

	getJSONObjectKeys:function(obj)
		{
		var keys = [];
   
		for(var key in obj)
			keys.push(key);
		
		return (keys);
		},
		
	refreshStylesheets:function()
		{
		var links = document.getElementsByTagName("link");
		for (var cl in links)
			{
			var link = links[cl];
			if (link.rel === "stylesheet")
				link.href += "";
			}
		},
		
	include:function(array,callback)
		{
		var numLoaded = 0;
		var waitFunction = function()
			{
			console.log('loaded ' + numLoaded)
			numLoaded++;
				
			if (numLoaded >= array.length)
				{
				console.log('CALLBACK')
				callback();
				}
			};
			
		for(var i = 0; i < array.length; i++)
			{
			var url = array[i].url;
			var type = array[i].type;
		
			// Determine the MIME type.
			var jsExpr = new RegExp( "js$", "i" );
			var cssExpr = new RegExp( "css$", "i" );
			if( type == null )
				if( jsExpr.test( url ) )
					type = 'text/javascript';
				else if( cssExpr.test( url ) )
					type = 'text/css';
            
			// Create the appropriate element.
			var element = null;
			switch( type )
				{
				case 'text/javascript' :
					element = document.createElement( 'script' );
					element.type = type;
					element.src = url;
					break;
				case 'text/css' :
					element = document.createElement( 'link' );
					element.rel = 'stylesheet';
					element.type = type;
					element.href = url;
					break;
				}
			
			element.onreadystatechange = waitFunction;
			element.onload = waitFunction;

			console.log('LOADING = ' + url)
			document.getElementsByTagName("head")[0].appendChild( element );
			}
		},
		
	getValueFromAttrs:function(attrs,key)
		{
		if ( (attrs == null) || (attrs.length <= 0) )
			return(null);

		for (var i in attrs)
			{
			if ( (attrs[i].attrkey != undefined) && (attrs[i].attrvalue != undefined) 	
				&&
				(attrs[i].attrkey.toLowerCase() == key.toLowerCase()) )
				return(attrs[i].attrvalue);
			}
			
		return (null);
		},
		
	applyAttrsToElem:function(elem, attrs)
		{
		if ( (elem == null) || (attrs == null) || (attrs.length <= 0) )
				return(elem);

		for (var i in attrs)
			{
			if ( (attrs[i].attrkey != undefined) && (attrs[i].attrvalue != undefined) )
				elem.setAttribute(attrs[i].attrkey,attrs[i].attrvalue);
			}
			
		return (elem);
		},
		
	createText:function(txtId,text,pt,positionMode,attrs,parentId)	
		{
		if (txtId)
			var textId = txtId;
		 else
			var textId = 'text';
		
		var svgns = "http://www.w3.org/2000/svg";
		
		var elem = document.createElementNS(svgns, "text");
		elem.setAttributeNS(null,"id", textId);
		elem.setAttributeNS(null,"x",pt.x);
		elem.setAttributeNS(null,"y",pt.y);
		
		if (positionMode)
			elem.setAttributeNS(null,"postiton",positionMode);
		
		gptut.applyAttrsToElem(elem, attrs);
		
		var elemText = document.createTextNode(text);
		elem.appendChild(elemText);

		if (parentId)
			{
			var textLayerElem = document.getElementById(parentId);
			textLayerElem.appendChild(elem)
			}
			
		return(elem);
		},
		
	createLabel:function(txtId,text,attrs,parentId)	
		{
		if (txtId)
			var textId = txtId;
		 else
			var textId = 'text';
	
		var elem = document.createElement("label");
		elem.setAttribute("id", textId);
		elem.innerHTML = text;
		
		gptut.applyAttrsToElem(elem, attrs);
	
		var textLayerElem = document.getElementById(parentId);
		textLayerElem.appendChild(elem)
				
		return(elem);
		},
		
   waitdelay:async function (ms) 
      {
      return new Promise(resolve => setTimeout(resolve, ms));
      },
};

if (typeof (module) !== 'undefined' && module.exports) 
	{
    module.exports = gptut
    };




