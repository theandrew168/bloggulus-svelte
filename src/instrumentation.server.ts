import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";

const sdk = new NodeSDK({
	serviceName: "bloggulus",
	instrumentations: [getNodeAutoInstrumentations()],
	traceExporter: new OTLPTraceExporter({
		url: "http://localhost:10428/insert/opentelemetry/v1/traces",
	}),
	logRecordProcessors: [
		new BatchLogRecordProcessor({
			exporter: new OTLPLogExporter({
				url: "http://localhost:9428/insert/opentelemetry/v1/logs",
			}),
		}),
	],
});

sdk.start();
