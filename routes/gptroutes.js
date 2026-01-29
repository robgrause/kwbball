var express = require('express');
var router = express.Router();

// require controller module
var server = require ('../controllers/gptServer');
var gptDbSys = require ('../controllers/gptDbUtils');

/* Pages. */
router.get('/', server.getAppPage);
router.get('/kwbball', server.getAppPage);

/* POST api */
//router.post('/api/createdbtable', server.gpt_createdbtable);
//router.post('/api/dropdbtable', server.gpt_dropdbtable);
//router.post('/api/loadDataFiles', server.gpt_system_loaddatafiles);

router.post('/api/getlist', server.gpt_getlist);

router.get('/api/getswkwbball', server.gpt_serviceworker_kwbball);

router.get('/api/version', server.gpt_serviceworker_version);

router.post('/api/startup', server.gpt_startup);

router.post('/api/teamget', server.gpt_team_getall);
router.post('/api/teamupdate', server.gpt_team_update);

router.post('/api/pitchtypeget', server.gpt_pitchtype_getall);
router.post('/api/pitchtypeupdate', server.gpt_pitchtype_update);

router.post('/api/pitchactionget', server.gpt_pitchaction_getall);
router.post('/api/pitchactionupdate', server.gpt_pitchaction_update);


router.post('/api/systemcreate', server.gpt_system_add);
router.post('/api/systemadd', server.gpt_system_add);
router.post('/api/systemget', server.gpt_system_get);
router.post('/api/systemupdate', server.gpt_system_update);

router.post('/api/systemdefaults', server.gpt_system_defaults);
router.post('/api/systemcleanup', server.gpt_system_cleanup);
router.post('/api/systemuploadimage', server.gpt_system_upload_image);

router.post('/api/usergetall', server.gpt_user_getall);
router.post('/api/usergetallbylastname', server.gpt_user_getallbylastname);
router.post('/api/usergetallbyclassyear', server.gpt_user_getallbyclassyear);
router.post('/api/usergetallbyteam', server.gpt_user_getallbyteam);
router.post('/api/usergetallpast', server.gpt_user_getallpast);
router.post('/api/usergetallcurrent', server.gpt_user_getallcurrent);
router.post('/api/usergetcoaches', server.gpt_user_getcoaches);
router.post('/api/userget', server.gpt_user_get);
router.post('/api/useradd', server.gpt_user_add);
router.post('/api/userupdate', server.gpt_user_update);
router.post('/api/userdelete', server.gpt_user_delete);

router.post('/api/sessionupload', server.gpt_session_upload);

router.post('/api/statsearch', server.gpt_stat_search);

router.post('/api/checkversion', server.gpt_version_check);

module.exports = router;
