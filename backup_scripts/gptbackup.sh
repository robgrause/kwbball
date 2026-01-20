#!/bin/bash

#----------------------------------------------------------------------------------
#
#	CRONTAB
#
#	Edit sudo crontab command : 'sudo crontab -e
#
#	30 23 * * * /projects/learnerlab/backup_scripts/gptbackup.sh >/dev/null 2>&1
#
#	Runs every day at 11:30pm
#	>/dev/null 2>&1 -- prevents crontab from sending email to process owner
#-----------------------------------------------------------------------------------
MYSQL_USERNAME='fof'
MYSQL_PASSWORD='fof'
MYSQL_BACKUP_CMD='mysqldump'
MYSQL_BACKUP_FILE='backup_databases'
MYSQL_BACKUP_FILEEXT='.sql'

PROJECT_FOLDER='/projects/gptfof'
BACKUP_FOLDER='./backups'
BACKUP_TARFILE=$MYSQL_BACKUP_FILE"-$(date +%F).tar"
BACKUP_GZFILE=$BACKUP_TARFILE".gz"

BACKUP_CMD='/bin/tar -czvf'

echo "********************************************"
echo "MYSQL BACKUP FILE: "$MYSQL_BACKUP_FILE
echo "BACKUP TAR FILE: "$BACKUP_TARFILE
echo "BACKUP FOLDER: "$BACKUP_FOLDER
echo "********************************************"

# change dir to project folder
cd $PROJECT_FOLDER

# make sure backups directory exits
if [ ! -d "$BACKUP_FOLDER" ]; then
	mkdir $BACKUP_FOLDER
fi


$MYSQL_BACKUP_CMD -u$MYSQL_USERNAME -p$MYSQL_PASSWORD --all-databases > $BACKUP_FOLDER/$MYSQL_BACKUP_FILE$MYSQL_BACKUP_FILEEXT

$BACKUP_CMD $BACKUP_FOLDER/$BACKUP_TARFILE $BACKUP_FOLDER/$MYSQL_BACKUP_FILE$MYSQL_BACKUP_FILEEXT
rm $BACKUP_FOLDER/$BACKUP_GZFILE
/bin/gzip $BACKUP_FOLDER/$BACKUP_TARFILE

#keep only 10 days worth 
/usr/bin/find $BACKUP_FOLDER -mtime +5 -delete

rm $BACKUP_FOLDER/$MYSQL_BACKUP_FILE$MYSQL_BACKUP_FILEEXT

echo "********************************************"
echo "MYSQL BACKUP FILE: "$MYSQL_BACKUP_FILE
echo "BACKUP FILE: "$BACKUP_FILE
echo "BACKUP FOLDER: "$BACKUP_FOLDER
echo "********************************************"

