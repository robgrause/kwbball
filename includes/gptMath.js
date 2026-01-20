var gptma = 
	{
	mathRoundup:function(num, precision) 
		{
		if (num == 0)
			return (num);
			
		tmpprecision = Math.pow(10, precision)
		
		return ( (Math.ceil(num * tmpprecision) / tmpprecision))
		},

	mathTrunc:function (num, decimalPlaces)
		{
		var multiplier = 1;

		multiplier = Math.pow(10, decimalPlaces)
	
		var numTmp = num * multiplier;

		return (parseInt(numTmp) / multiplier);
		},

	numToHex:function(num) 
		{
		var hex = num.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
		},
	rgbToHex:function (r, g, b) 
		{
		return "#" + gptma.numToHex(r) + gptma.numToHex(g) + gptma.numToHex(b);
		},
		
	hexToRgb:function(h)
		{
		var r = parseInt((gptma.cutHex(h)).substring(0,2),16);
		var g = parseInt((gptma.cutHex(h)).substring(2,4), 16);
		var b = parseInt((gptma.cutHex(h)).substring(4,6),16);
		return ({'red': r, 'green': g, 'blue': b});
		},

	cutHex:function(h)	{return (h.charAt(0)=="#") ? h.substring(1,7):h	},
	
};



if (typeof (module) !== 'undefined' && module.exports) 
	{
	
    module.exports = gptma
    };
