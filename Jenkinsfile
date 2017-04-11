#!groovy

node {
  stage('Docker pull the maven image') {
    sh 'docker pull maven:3-jdk-8'
  }
  withDockerContainer(image: 'maven:3-jdk-8') {
    sshagent('medde-deploy-key') {
      stage('Configuring SSH') {
        sh "ssh -oStrictHostKeyChecking=no git@github.com || true"
      }
      stage('Getting the sources') {
        git url: 'git@github.com:camptocamp/medde_geonetwork3.git'
        sh 'git submodule update --init --recursive'
      }
      stage('First build without test') {
        sh '''mvn clean install -B -Dmaven.repo.local=./.m2_repo -DskipTests'''
      }
      stage('Second build with tests') {
        sh '''mvn clean install -B -Dmaven.repo.local=./.m2_repo'''
      }
      stage('Archive artifacts') {
        archive 'target/*.war,target/*.zip'
      }
      stage("Saving tests results") {
        junit '**/target/surefire-reports/TEST-*.xml'
      }
    } // sshagent
  } // withDockerContainer
} // node
