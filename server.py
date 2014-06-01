import os 
import sys
import cherrypy
import ConfigParser
import urllib2
import simplejson as json
import webtools
import time
import datetime
import random
import urllib

import collections
import hashlib

class Server(object):
    def __init__(self, config):
        self.production_mode = config.getboolean('settings', 'production')
        self.cache_dir = '/lab/mir/data/image_cache'
        self.total = 0;
        self.cached = 0;


    def img(self, url):
        cherrypy.response.headers['Content-Type']= 'image/jpeg'
        results = self.read_from_cache(url)
        self.total += 1
        if results == None:
            f = urllib2.urlopen(url)
            results = f.read()
            self.write_to_cache(url, results);
            f.close()
        else:
            self.cached += 1

        print 'total', self.total, 'cached', self.cached
        return results;
    img.exposed = True


    def analysis(self, url, callback=None, _=''):
        if callback:
            cherrypy.response.headers['Content-Type']= 'text/javascript'
        else:
            cherrypy.response.headers['Content-Type']= 'application/json'

        js = '{}'
        if url.startswith("https://echonest-analysis"):
            try:
                f = urllib.urlopen(url)
                js = f.read()
                f.close()
            except:
                print "Can't read url"

        if callback:
            results = callback + "(" + js + ")"
        else:
            results = js
        return results
    analysis.exposed = True

    def test(self, callback=None):
        results = 'hello, world'
        return to_json(results, callback)
    test.exposed = True


    def read_from_cache(self, url):
        md5 = self.get_md5(url)
        full_path = os.path.join(self.cache_dir, md5)
        if os.path.exists(full_path):
            with open(full_path) as f:
                return f.read()
        else:
            return None;

    def write_to_cache(self, url, results):
        md5 = self.get_md5(url)
        full_path = os.path.join(self.cache_dir, md5)
        with open(full_path, 'w') as f:
            f.write(results)

    def get_md5(self, url):
        m = hashlib.md5()
        m.update(url)
        return m.hexdigest()



def to_json(dict, callback=None):
    results =  json.dumps(dict, sort_keys=True, indent = 4) 
    if callback:
        results = callback + "(" + results + ")"
    return results

if __name__ == '__main__':
    urllib2.install_opener(urllib2.build_opener())
    conf_path = os.path.abspath('web.conf')
    print 'reading config from', conf_path
    cherrypy.config.update(conf_path)

    config = ConfigParser.ConfigParser()
    config.read(conf_path)
    production_mode = config.getboolean('settings', 'production')

    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Set up site-wide config first so we get a log if errors occur.

    if production_mode:
        print "Starting in production mode"
        cherrypy.config.update({'environment': 'production',
                                'log.error_file': 'simdemo.log',
                                'log.screen': True})
    else:
        print "Starting in development mode"
        cherrypy.config.update({'noenvironment': 'production',
                                'log.error_file': 'site.log',
                                'log.screen': True})

    conf = webtools.get_export_map_for_directory("client")
    cherrypy.quickstart(Server(config), '/3dServer', config=conf)

