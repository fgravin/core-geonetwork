#!/usr/bin/groovy

// Load shared library
@Library('c2c-pipeline-library') import static com.camptocamp.utils.*

selectNodes {
    (it.memorysize_mb as Float) > 12000
}

dockerBuild {
  stage('Docker pull the maven image') {
    sh 'docker pull maven:3-jdk-8'
    sh 'docker pull pmauduit/google-drive-publisher'
  }
  withDockerContainer(image: 'maven:3-jdk-8') {
    stage('Getting the sources') {
      git url: 'git@github.com:camptocamp/medde_geonetwork3.git', branch: env.BRANCH_NAME, credentialsId: 'medde-deploy-key'
      sh 'git submodule update --init --recursive'
    }
    stage('First build without test') {
      sh '''mvn clean install -B -Dmaven.repo.local=./.m2_repo -DskipTests'''
    }
    stage('Second build with tests') {
      sh '''mvn clean install -B -Dmaven.repo.local=./.m2_repo -fn'''
    }
   stage("Saving tests results") {
      junit '**/target/surefire-reports/TEST-*.xml'
    }
  } // withDockerContainer
  stage("Publishing webapp onto GoogleDrive") {
    if (env.BRANCH_NAME == 'medde') {
      withCredentials([file(credentialsId: 'gdrive-georchestra.properties',
            variable: 'FILE')]) {
        sh """docker run --rm -v $FILE:/gdrive.properties              \
          -v `pwd`/web/target/geonetwork.war:/geonetwork.war       \
          -e FOLDER_NAME='livraison-medde'                         \
          -e SOURCE_FILE='/geonetwork.war'                         \
          -e TARGET_FILENAME='geonetwork.war'                      \
          pmauduit/google-drive-publisher"""
      } // withCredentials
    } // if
  } // stage
} // dockerBuild
