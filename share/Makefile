.PHONY: device.build device.up edge.up

device.build:
	cd device/services/vision-capture-service && docker compose build

device.up:
	cd device/services/vision-capture-service && docker compose up -d

edge.up:
	cd edge && docker compose up -d
