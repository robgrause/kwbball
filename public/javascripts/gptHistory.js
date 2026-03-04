var gpthistory = 
	{	
	loadConfig:function (cmdId,args)
		{
		if (cmdId == 'cmdHistory')
			{
			gptut.setShowState('divHistory',true);
			gptsession.buildRegionsArray();

			gptsession.buildPitchBox(gptsession.divHistoryPitchId);
	
			var cmds = new gptmain.objMainCmds();
			gptmain.registerCmds(cmds);
			}
		},
};
