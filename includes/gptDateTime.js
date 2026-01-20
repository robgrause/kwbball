/*********************************************************************************
	Helper Functions


**********************************************************************************/
if (defines == undefined)
	var defines = require ('./gptDefines');
	
var gptdt =
	{
	getDate:function(date)
		{
		var now;

		if (date)
			now = new Date(date);
		else
			now = new Date();
				
		var day = ('0' + now.getDate()).slice(-2);
		var month = ('0' + (now.getMonth() + 1)).slice(-2);
		var today = now.getFullYear() + '-' + (month) + '-' + (day);
				
		return (today);
		},
		
	getISODate:function(date)
		{
		if (date == undefined)
			return(new Date(Date.now()).toISOString().slice(0, 10));
		else
			return(new Date(date).toISOString().slice(0, 10));
		},
		
	getISODateTime:function(date)
		{
		if (date == undefined)
			return(new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' '));
		else
			return(new Date(date).toISOString().slice(0, 19).replace('T', ' '));
		},
		
	getISOSearchDateTime:function(date)
		{
		if (date == undefined)
			return(new Date(Date.now()).toISOString()); //.slice(0, 19).replace('T', ' '));
		else
			return(new Date(date).toISOString()); //.slice(0, 19).replace('T', ' '));
		},
		
	getISODateFromDayMonthYear:function(day,month,year)
		{
		var newDate = new Date();
		
		newDate.setFullYear(year);
		newDate.setMonth(month);
		newDate.setDate(day);

		return(gptdt.getISODate(newDate));
		},
	
	getLocalSystemTimezone:function()
		{
		return(Intl.DateTimeFormat().resolvedOptions().timeZone)
		},
		
	getTimeZoneOffsetFromUTC:function (timezoneStr)
		{
		var date = new Date();
		var offsetInMinutes = date.getTimezoneOffset()
		return(offsetInMinutes * 60 * 1000);
		
/*
		var options = {'timeZone' : timezoneStr};			
		var timezoneDateStr = date.toLocaleString("en-US", options);
		
		var dateString = date.toString();

		// offset in milliseconds
		var offset = Date.parse(`${dateString} UTC`) - Date.parse(timezoneDateStr);

		return offset;
*/
		},
				
	formatLocalDate:function (date, format) 
		{
		if (date == undefined)
			var date = new Date();
			
		var testdate = Date.parse(date);
		if (isNaN(testdate) == true)
			return('');
	
		date = new Date(testdate);

		var testdate = new Date (date.getTime());

		if (isNaN(testdate) == true)
			return('');

		// NOTE: use local date and time 
		const map = 
			{
			mm: ("0" + (testdate.getMonth() + 1)).slice(-2),
			dd: ("0" + testdate.getDate()).slice(-2),
			yy: testdate.getFullYear().toString().slice(-2),
			yyyy: testdate.getFullYear(),
			HH: ("0" + testdate.getHours()).slice(-2),   // ("0" + (date.getHours() + 1)).slice(-2),
			MM: ("0" + testdate.getMinutes()).slice(-2), //("0" + (date.getMinutes() + 1)).slice(-2),
			SS: '00'
			}

		// need to insure hours and minutes are in correct range
		if (map.HH >= 24)
			map.HH = 23;
			
		if (map.MM >= 60)
			map.MM = 59;
		
		map.ampm = map.HH >= 12 ? 'pm' : 'am';
		map.ampmHH = map.HH % 12;
			
		map.ampmHH = map.ampmHH ? map.ampmHH : 12; // the hour '0' should be '12'
		map.ampmMM = map.MM; // < 10 ? '0' + map.MM : map.MM;
	
		return format.replace(/mm|dd|yyyy|HH|MM|SS|ampmHH|ampmMM|ampm/gi, matched => map[matched])
		},
		
	convertLocalDateToUFCDate:function(date,toUTC,localtimezone)
		{
		if (localtimezone == undefined)
			var localtimezone = gptdt.getLocalSystemTimezone();

		var timeoffset = gptdt.getTimeZoneOffsetFromUTC(localtimezone);
		
		if (date == undefined)
			var date = new Date(Date.now());

		if (toUTC == true)
			date = new Date (date.getTime() + Math.abs(timeoffset));
		else
			date = new Date(date.getTime() - Math.abs(timeoffset));
			
		return(date);
		},
	convertUTCToLocalDateFormat:function(dateUTCStr,format,localtimezone)
		{
		if (localtimezone == undefined)
			var localtimezone = gptdt.getLocalSystemTimezone();

		var timeoffset = gptdt.getTimeZoneOffsetFromUTC(localtimezone)
		
		var tmpStr = dateUTCStr;
		if (typeof(tmpStr) != 'string')
			tmpStr = dateUTCStr.toString();
					
		if (tmpStr.includes('GMT') == false)
			{
			tmpStr = tmpStr.replace(' ', 'T');
			if (tmpStr[tmpStr.length - 1] != 'Z')
				tmpStr = tmpStr + '.000Z'
			}
			
		var date = new Date(tmpStr);
		var testdate = Date.parse(date);

		if (isNaN(testdate) == true)
			return('');

		date = new Date(testdate);

		var testdate = new Date (date.getTime() - Math.abs(timeoffset));
		
		if (isNaN(testdate) == true)
			return(null);

		const map = 
			{
			mm: ("0" + (testdate.getUTCMonth() + 1)).slice(-2),
			dd: ("0" + testdate.getUTCDate()).slice(-2),
			yy: testdate.getUTCFullYear().toString().slice(-2),
			yyyy: testdate.getUTCFullYear(),
			HH: ("0" + testdate.getUTCHours()).slice(-2),   // ("0" + (date.getHours() + 1)).slice(-2),
			MM: ("0" + testdate.getUTCMinutes()).slice(-2), //("0" + (date.getMinutes() + 1)).slice(-2),
			SS: '00'
			}

		// need to insure hours and minutes are in correct range
		if (map.HH >= 24)
			map.HH = 23;
			
		if (map.MM >= 60)
			map.MM = 59;
		
		map.ampm = map.HH >= 12 ? 'pm' : 'am';
		map.ampmHH = map.HH % 12;
			
		map.ampmHH = map.ampmHH ? map.ampmHH : 12; // the hour '0' should be '12'
		map.ampmMM = map.MM; // < 10 ? '0' + map.MM : map.MM;

		return format.replace(/mm|dd|yyyy|HH|MM|SS|ampmHH|ampmMM|ampm/gi, matched => map[matched])
		},

	formatAMPMTime:function(date) 
		{
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        time = hours + ":" + minutes + ":" + seconds + " " + am_pm;
        return(time);
		},

	formatTime12hrTo24hr:function(hour,minute,ampm)
		{
		if ( (ampm != undefined) && (ampm == 'pm') )
			return((parseInt(hour) + 12) + '.' + minute);
		else
			return(hour + '.' + minute);
		},
	formatTime24hrTo12hr:function(time)
		{
		if (typeof (time) != 'string')
			var numarray = time.toString().split('.');
		else
			var numarray = time.split('.');

		var hour = numarray[0];
		
		var minute = 0;
		if (numarray.length > 1)
			var minute = numarray[1];
			
		var minute = parseInt(minute) < 10 ? "0" + parseInt(minute) : minute;
		
		var ampm = 'am';
		
		if (parseInt(hour) > 12)
			{
			hour = parseInt(hour) - 12;
			ampm = 'pm';
			}
		return ({'hour':hour, 'minute':minute, 'ampm':ampm});
		},
		
	get12HrDisplayFrom24hour:function (time)
		{
		var results = gptdt.formatTime24hrTo12hr(time)
		return(results.hour + ':' + results.minute + ' ' + results.ampm);
		},
	formatElapsedTime:function (elapsedTime)
		{
		var deltaSeconds = elapsedTime / 1000;
		var timeHours = gptma.mathTrunc(deltaSeconds / (60 * 60), 0);
		var deltaSeconds = deltaSeconds - (timeHours * (60 * 60));
		var timeMinutes = gptma.mathTrunc(deltaSeconds / 60, 0);
		var timeSeconds = gptma.mathTrunc(deltaSeconds - (timeMinutes * 60), 0);
		var HH = ("0" + (timeHours)).slice(-2);
		var MM = ("0" + (timeMinutes)).slice(-2);
		var SS = ("0" + (timeSeconds)).slice(-2);
		
		var display = HH + ':' + MM + ':' + SS;
		
		return(display);
		},
	
	getWeekNumber:function(date) 
		{
		var tmpdate = new Date(date.getTime());
		tmpdate.setHours(0, 0, 0, 0);
		// Thursday in current week decides the year.
		tmpdate.setDate(tmpdate.getDate() + 3 - (tmpdate.getDay() + 6) % 7);
		// January 4 is always in week 1.
		var week1 = new Date(tmpdate.getFullYear(), 0, 4);
		// Adjust to Thursday in week 1 and count number of weeks from date to week1.
		return 1 + Math.round(((tmpdate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
		},

	getWeekYear:function(date) 
		{
		var tmpdate = new Date(date.getTime());

		tmpdate.setDate(tmpdate.getDate() + 3 - (tmpdate.getDay() + 6) % 7);
		return tmpdate.getFullYear();
		},

	getWeekdays:function(date)
		{
		if(!date)
			var tmpdate = new Date(Date.now());
		else
			var tmpdate = new Date(date)

		var sundayDeltaDays = tmpdate.getDay();

		tmpdate.setDate(tmpdate.getDate() - sundayDeltaDays + 1)
		
		// NOTE: Add 1 day here because their is a day difference between
		// date and javascript date
		//tmpdate.setDate(tmpdate.getDate() + 1)

		var days = [];

		for(var i = 0; i < 7; i++)
			{
			var day = new defines.objTimesheetDay();
			
			day.f_date_record = gptdt.getDate(tmpdate);
			days.push(day);
			
			tmpdate.setDate(tmpdate.getDate() + 1); 
			}

		return(days);
		},
		
	isWeekCurrentWeek:function(week)
		{
		var curWeek = gptdt.getWeekdays(null);

		if (curWeek[0].f_date_record == week[0].f_date_record)
			return(true)
		else
			return(false)
		},
		
	getJSDatefromSQLDate:function(sqlDate)
		{
		//  yyyyy-mm-dd --> yyyy/mm/dd
		// There is a day differnet between sqlDate and javascript date
		var date = new Date(sqlDate)
		
		date.setDate(date.getDate() + 1);
		// need to add 1 day
		var tmpdate = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + (date.getDate());

		return(tmpdate)
		},
};


if (typeof (module) !== 'undefined' && module.exports) 
	{
	const gptutils = require ('./gptUtils');
	
    module.exports = gptdt
    };
