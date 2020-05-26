#! /bin/bash

gcloud builds submit \
    --tag gcr.io/$(gcloud config get-value project)/remote-mob 



gcloud run deploy remote-mob \
    --image gcr.io/$(gcloud config get-value project)/remote-mob \
    --platform managed \
    --region=europe-west1


