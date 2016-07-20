
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets', async (req, res) =>{

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.getToken('2legged')

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getBuckets(
        token.access_token)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/details', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.getToken('2legged')

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getBucketDetails(
        token.access_token, bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.getToken('2legged')

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getObjects(
        token.access_token, bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey/details', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.getToken('2legged')

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getObjectDetails(
        token.access_token,
        bucketKey,
        objectKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var ossSvc = ServiceManager.getService(
        'OssSvc')

      var token = await forgeSvc.getToken('2legged')

      var buffer = await ossSvc.getObject(
        token.access_token,
        bucketKey,
        objectKey)

      res.end(buffer)

    } catch(ex) {

      console.log(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/buckets', async (req, res) => {

    try {

      var bucketCreationData = req.body.bucketCreationData

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.getToken('2legged')

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.createBucket(
        token.access_token,
        bucketCreationData)

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var ossSvc = ServiceManager.getService(
        'OssSvc')

      var token = await forgeSvc.getToken('2legged')

      var response = await ossSvc.deleteObject(
        token.access_token,
        bucketKey,
        objectKey)

      res.end(response)

    } catch(ex) {

      console.log(ex)
    }
  })

  return router
}