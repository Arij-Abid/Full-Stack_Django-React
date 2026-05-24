pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub_id')
      //  SONAR_TOKEN = credentials('sonar-token')
       // NEXUS_URL = "http://your-nexus-url:8081"
    }

    stages {

        stage('Checkout') {
            steps {

                git branch: 'main',
                url: 'https://github.com/Arij-Abid/Full-Stack_Django-React.git'
                sh 'ls -la'

            }
        }

/*
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=django-react-project \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube:9000 \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }
        */

        /* =========================
           3. BACKEND (DJANGO)
        ========================== */
        stage('Backend Tests') {
            steps {
               dir('django-ecommerce'){
                    sh '''
                        python -m pip install -r requirements.txt
                        python manage.py test
                    '''
                }
            }
        }

        /* =========================
           4. FRONTEND (REACT)
        ========================== */
        stage('Frontend Build') {
            steps {
              dir('react-ecommerce-site'){
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        /* =========================
           5. BUILD DOCKER IMAGES
        ========================== */
        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                        docker build -t arijabid/backend:${BUILD_ID} ./backend
                        docker build -t arijabid/frontend:${BUILD_ID} ./frontend
                    """
                }
            }
        }

        /* =========================
           6. DOCKER HUB PUSH
        ========================== */
        stage('Push Docker Hub') {
            steps {
                sh """
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin

                    docker push arijabid/backend:${BUILD_ID}
                    docker push arijabid/frontend:${BUILD_ID}
                """
            }
        }


      /*  stage('Push to Nexus') {
            steps {
                echo "Upload artifacts to Nexus (optionnel)"
                // Exemple si tu utilises mvn ou zip artifact
                // sh "curl -u user:pass --upload-file backend.zip ${NEXUS_URL}/repository/maven-releases/"
            }
        }
*/
        /* =========================
           8. DEPLOY WITH DOCKER COMPOSE
        ========================== */
        stage('Deploy') {
            steps {
                sh """
                    docker compose down
                    docker compose up -d --build
                """
            }
        }
    }

    /* =========================
       POST ACTIONS
    ========================== */
    post {
        always {
            sh 'docker logout || true'
            echo 'Pipeline terminé'
        }

        success {
            echo '✅ Build réussi'
        }

        failure {
            echo '❌ Pipeline échoué'
        }
    }
}
