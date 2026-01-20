var gptsvg = 
	{
	svgns : "http://www.w3.org/2000/svg",
	xlink :	"http://www.w3.org/1999/xlink",
	
	attrsAddAttr:function(attrs,key,value)
		{
		attrs.push ({'key': key, 'value': value});
		
		return(attrs);
		},
		
	attrsApply:function(elem, attrs)
		{
		if ( (elem == null) || (attrs == null) || (attrs.length <= 0) )
				return(elem);

		for (var i in attrs)
			{
			if ( (attrs[i].key != undefined) && (attrs[i].value != undefined) )
				elem.setAttributeNS(null,attrs[i].key,attrs[i].value);
			}
			
		return (elem);
		},

	divCreate:function(elemId,parentId,attrs)
		{
		gptut.deleteElement(elemId);

		var elem = document.createElementNS(gptsvg.svgns, "div");
		elem.setAttributeNS(null,"id", elemId);
		
		gptsvg.attrsApply(elem, attrs);

		var parentElem = document.getElementById(parentId);
		parentElem.appendChild(elem);
		
		return(elem)
		},
		
	svgCreate:function(elemId,parentId,attrs)
		{
		gptut.deleteElement(elemId);

		var svgElem = document.createElementNS(gptsvg.svgns, "svg");
		svgElem.setAttribute('xmlns:xlink', gptsvg.xlink); 
		svgElem.setAttributeNS(null,"id", elemId);

		gptsvg.attrsApply(svgElem, attrs);

		var parentElem = document.getElementById(parentId);
		parentElem.appendChild(svgElem);
		
		return(svgElem)
		},
	
	layerCreate:function(elemId,parentId,attrs)
		{
		gptut.deleteElement(elemId);

		var elem = document.createElementNS(gptsvg.svgns, "g");
		elem.setAttributeNS(null,"id", elemId);
		
		gptsvg.attrsApply(elem, attrs);

		var parentElem = document.getElementById(parentId);
		parentElem.appendChild(elem);
		
		return(elem)
		},	
	
	textCreate:function(elemId,parentId,textLbl,attrs)	
		{
		var elem = document.createElementNS(gptsvg.svgns, "text");
		elem.setAttributeNS(null,"id", elemId);

		gptsvg.attrsApply(elem, attrs);
		
		var elemText = document.createTextNode(textLbl);
		elem.appendChild(elemText);

		var parentElem = document.getElementById(parentId);
		parentElem.appendChild(elem)
		
		return(elem);
		},

	pathCreatePtsStr:function(pts, closePathFlag)
		{
		var pathStr = '';
		for (var i = 0; i < pts.length; i++)
			{	
			if (i == 0)
				var ptStr = 'M ' + gptma.mathTrunc(pts[i].x,2) + ' ' + gptma.mathTrunc(pts[i].y,2);
			else
				var ptStr = ',L ' + gptma.mathTrunc(pts[i].x,2) + ' ' + gptma.mathTrunc(pts[i].y,2);
					
			pathStr = pathStr + ptStr;
			}
			
		if (closePathFlag)
			pathStr += ',L ' + gptma.mathTrunc(pts[0].x,2) + ' ' + gptma.mathTrunc(pts[0].y,2);
		
		return(pathStr);
		},
			
	pathCreate:function(elemId,parentId,attrs)
		{
		gptut.deleteElement(elemId);
				
		var elem = document.createElementNS(gptsvg.svgns, "path");
		elem.setAttributeNS(null,"id", elemId);
	
		gptsvg.attrsApply(elem, attrs)
		
		var parentElem = document.getElementById(parentId);
		parentElem.appendChild(elem);

		return(elem);
		},
/*		
	rectCreate:function (elemid,parentid,pts,attrs)
		{
		gptut.deleteElement(elemId);
				
		var elem = document.createElementNS(gptsvg.svgns, "path");
		elem.setAttributeNS(null,"id", elemId);
	
		gptsvg.attrsApply(elem, attrs)
		
		var parentElem = document.getElementById(parentId);
		parentElem.appendChild(elem);

		return(elem);
		},
*/
};




