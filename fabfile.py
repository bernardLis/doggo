from fabric import Connection
import zipfile
import datetime
from invoke import Responder
from datetime import date
import os, time

directory = 'D:/projects/doggo'

# zip name
today = date.today()
d1 = today.strftime('%Y-%m-%d')
zipName = d1 + '.zip'

# zipping directories
# https://stackoverflow.com/questions/1855095/how-to-create-a-zip-archive-of-a-directory-in-python
def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))

def zip_files():
    # creating zip with files
    print("zipping...")
    zf = zipfile.ZipFile(zipName, mode='w')

    # directories
    zipdir('templates/', zf)
    zipdir('static/', zf)

    # files
    zf.write('myproject.py')
    #zf.write('doggoDB.db')
    zf.write('helpers.py')
    zf.write('requirements.txt')

    zf.close()

def upload_archive():

    print('uploading...')
    # establishing connection to the server
    c = Connection(
        host = "178.128.193.27",
        user = "czoks",
        connect_kwargs = {
            "key_filename": "D:\projects\doggo\.ssh\openSSH",
        },
    )
    # uploading the zip to myproject directory
    c.put(zipName, 'myproject/')

    print('exctracting...')
    # unziping and overwriting the files
    c.run('cd myproject && unzip -o %s' % zipName)

    # removing the archive
    c.run('cd myproject && rm %s' %zipName)

    # does server restart correctly?
    # sudo -S -p '[sudo] password: ' systemctl status postgresql-9.6.service
    sudopass = Responder(
        pattern=r'\[sudo\] password:',
        response='1992\n',
    )
    # does not work : c.config.sudo.password('1992')
    print('restarting...')
    c.sudo('systemctl restart myproject', pty=True, watchers=[sudopass])

def local_cleanup():
    print('cleaning up...')
    # check archive for file from today
    if os.path.isfile(os.path.join(directory + '/archive', zipName)):
        # rename the file with h and m
        now = datetime.datetime.now()
        NewZipName = d1 + '-' + str(now.hour) + 'h' + str(now.minute) + 'm.zip'

        # move zip to archive
        os.replace(os.path.join(directory, zipName), os.path.join(directory + '/archive', NewZipName))

    else:
        # move zip to archive
        os.replace(os.path.join(directory, zipName), os.path.join(directory+'/archive', zipName))

def deploy():
    zip_files()
    upload_archive()
    local_cleanup()
    print('done!')

deploy()
