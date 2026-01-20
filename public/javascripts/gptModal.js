var modal = 
	{
	modalParams: 
			{
			headerStr: '',
			msg1Str: '',
			msg2Str: '',
			footerStr: '',
			callback: null,
			retVal:'',
			modalMode: '',
			showSelectFile: true,
			exitMode: '',
			mode: 
				{
				modeNone: 0,
				modeYesNo: 1,
				modeOkCancel: 2,
				modeOk: 3
				},
			exit: 
				{
				exitNone: -1,
				exitCancel: 0,
				exitOk: 1,
				exitYes: 2,
				exitNo: 3
				}
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
	setControlShowState:function(ctrlId, show)
		{
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
	setDivControlsShowState:function(divId, show, includeDiv)
		{	
		if (show)
			{
			$('#' + divId).find('*').show();
			$('#' + divId).find('*').removeClass('hide');
			if ( (includeDiv == null) || (includeDiv == true) )
				{
				$('#' + divId).show();
				$('#' + divId).removeClass('hide');
				}
			}
		else
			{
			$('#' + divId).find('*').hide();
			if ( (includeDiv == null) || (includeDiv == true) )
				$('#' + divId).hide();
			}
		},
	displayModalOpen:function (header, msg1, msg2, footer, mode, callback)
		{
		modal.modalParams.modalMode = '';
		modal.modalParams.headerStr = '';
		modal.modalParams.msg1Str = '';
		modal.modalParams.msg2Str = '';
		modal.modalParams.footerStr = '';
		modal.modalParams.callback = '';

		if (mode)
			modal.modalParams.modalMode = mode;
				
		if (header)
			modal.modalParams.headerStr = header;
				
		if (msg1)
			modal.modalParams.msg1Str = msg1;
		
		if (msg2)
			modal.modalParams.msg2Str = msg2;
		
		if (footer)
			modal.modalParams.footerStr = footer;
				
		if (callback)
			modal.modalParams.callback = callback;
			
		modal.initializeModal();
		},

	displayDeleteConfirmation:function (header, msg1, msg2, retVal, callback)
		{
		modal.modalParams.modalMode = '';
		modal.modalParams.headerStr = '';
		modal.modalParams.msg1Str = '';
		modal.modalParams.msg2Str = '';
		modal.modalParams.footerStr = '';
		modal.modalParams.callback = '';
		modal.modalParams.retVal = '';

		modal.modalParams.modalMode = modal.modalParams.mode.modeYesNo;
				
		if (header)
			modal.modalParams.headerStr = header;
				
		if (msg1)
			modal.modalParams.msg1Str = msg1;
			
		if (msg2)
			modal.modalParams.msg2Str = msg2;
		
		if (callback)
			modal.modalParams.callback = callback;
			
		if (retVal)
			modal.modalParams.retVal = retVal;
	
		modal.initializeModal();
		},
	
	initializeModal:function()
		{
		modal.Config();
				
		$('#modalDialog').show();

		if (modal.modalParams.modalMode == modal.modalParams.mode.modeYesNo)
			{
			modal.setDivControlsShowState('modalOkCancelMode', false, true);
			modal.setDivControlsShowState('modalYesNoMode', true, true);			
			}
		else if (modal.modalParams.modalMode == modal.modalParams.mode.modeOkCancel)
			{
			modal.setDivControlsShowState('modalYesNoMode', false, true);
			modal.setDivControlsShowState('modalOkCancelMode', true, true);
			}
		else if (modal.modalParams.modalMode == modal.modalParams.mode.modeOk)
			{
			modal.setDivControlsShowState('modalYesNoMode', false, true);
			modal.setDivControlsShowState('modalOkCancelMode', true, true);
			modal.setControlShowState('btn_modal_cancel',false);
			}

		if (modal.modalParams.headerStr)
			$('#modalHeader').html (modal.modalParams.headerStr);
		
		if (modal.modalParams.msg1Str)
			$('#modalMsg1').html (modal.modalParams.msg1Str);
		
		if (modal.modalParams.msg2Str)
			$('#modalMsg2').html (modal.modalParams.msg2Str);
		
		if (modal.modalParams.footerStr)
			$('#modalFooter').html (modal.modalParams.footerStr);
		},
		
	processExit:function(retMode,val)
		{
		$('#modalDialog').hide();
		
		if (modal.modalParams.callback)
			modal.modalParams.callback(retMode, modal.modalParams.retVal);
		},
				
	onclickModalCancel:function(e) {modal.processExit(modal.modalParams.exit.exitCancel)},
	onclickModalOk:function (e) {modal.processExit(modal.modalParams.exit.exitOk)},
	onclickModalYes:function(e) {modal.processExit(modal.modalParams.exit.exitYes)},
	onclickModalNo:function(e) {modal.processExit(modal.modalParams.exit.exitNo)},
	
	Config:function()
		{
		if (modal.spinnerparentId.length > 0)
			modal.displaySpinner(modal.spinnerparentId, false);
			
		var btnElem = document.getElementById( 'btn_modal_cancel');
		if (btnElem)
			btnElem.addEventListener("click", modal.onclickModalCancel);
		
		var btnElem = document.getElementById( 'btn_modal_ok');
		if (btnElem)
			btnElem.addEventListener("click", modal.onclickModalOk);
		
		var btnElem = document.getElementById( 'btn_modal_yes');
		if (btnElem)
			btnElem.addEventListener("click", modal.onclickModalYes);
		
		var btnElem = document.getElementById( 'btn_modal_no');
		if (btnElem)
			btnElem.addEventListener("click", modal.onclickModalNo);
		},
		
	spinnerparentId : '',
	timeOutId : 0,
	spinnerTime : 20,
	callback : null,
	displaySpinner:function (parentId, display)
		{
		var parentElem = document.getElementById(parentId);
		
		if (parentElem == undefined)
			{
			clearTimeout(modal.timeOutId);
			modal.spinnerparentId = '';
			modal.timeOutId = 0;
			return(false);
			}
			
		modal.spinnerparentId = parentId;
		
		if ( (display == true) && (modal.timeOutId <= 0) )
			{
			modal.setDivControlsShowState(parentId, true, true);
			
			parentElem.innerHTML = "<div class='lds-roller'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>";
		
			modal.timeOutId = setTimeout(() => 
				{
				modal.displaySpinner (modal.spinnerparentId, false)
				clearTimeout(modal.timeOutId);
				modal.timeOutId = 0;
				return(true);
				}, modal.spinnerTime * 1000);
			}
		else
			{
			modal.setDivControlsShowState(parentId, false, true);
	
			modal.deleteElementsByClass('lds-roller')
			
			parentElem.innerHTML = "";
				
			clearTimeout(modal.timeOutId);
			modal.spinnerparentId = '';
			modal.timeOutId = 0;
			return(false);
			}
		},
};
