#!groovy

node {
  stage('Docker pull the maven image') {
    sh 'docker pull maven:3-jdk-8'
  }
  withDockerContainer(image: 'maven:3-jdk-8') {
    stage('Getting the sources') {
      git url: 'git@github.com:camptocamp/medde_geonetwork3.git', branch: 'medde', credentialsId: 'medde-deploy-key'
      sh 'git submodule update --init --recursive'
    }
    stage('First build without test') {
      sh '''mvn clean install -B -Dmaven.repo.local=./.m2_repo -DskipTests'''
    }
    stage('Second build with tests') {
      sh '''mvn clean install -B -Dmaven.repo.local=./.m2_repo -fae'''
    }
    stage('Archive artifacts') {
      archive 'web/target/*.war'
    }
    stage("Saving tests results") {
      junit '**/target/surefire-reports/TEST-*.xml'
    }
  } // withDockerContainer
} // node
