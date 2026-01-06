-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "user" TEXT,
    "process" TEXT,
    "service" TEXT,
    "sourceIp" TEXT,
    "destIp" TEXT,
    "geo" TEXT,
    "severityHint" TEXT NOT NULL,
    "confidenceHint" REAL NOT NULL DEFAULT 0.5,
    "metadata" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "priority" TEXT DEFAULT 'Medium',
    "signals" TEXT NOT NULL,
    "detectorName" TEXT NOT NULL,
    "detectionMethod" TEXT,
    "alertType" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "mitreTactics" TEXT NOT NULL,
    "mitreTechniques" TEXT NOT NULL,
    "mitreSubTechniques" TEXT,
    "killChainPhase" TEXT,
    "riskScore" REAL DEFAULT 0,
    "riskLevel" TEXT,
    "riskMessage" TEXT,
    "riskObject" TEXT,
    "riskObjectType" TEXT,
    "threatScore" REAL,
    "impactScore" REAL,
    "urgencyScore" REAL,
    "threatObject" TEXT,
    "threatObjectType" TEXT,
    "iocType" TEXT,
    "iocValue" TEXT,
    "threatActor" TEXT,
    "threatGroup" TEXT,
    "campaignName" TEXT,
    "malwareFamily" TEXT,
    "attackVector" TEXT,
    "threatConfidence" TEXT,
    "user" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "userDomain" TEXT,
    "userBunit" TEXT,
    "userDepartment" TEXT,
    "userTitle" TEXT,
    "userCategory" TEXT,
    "userRiskScore" REAL,
    "userEndDate" TEXT,
    "userId" TEXT,
    "userSid" TEXT,
    "hostName" TEXT,
    "hostIp" TEXT,
    "hostMac" TEXT,
    "hostOs" TEXT,
    "hostOsVersion" TEXT,
    "hostDomain" TEXT,
    "hostCriticality" TEXT,
    "assetId" TEXT,
    "assetOwner" TEXT,
    "assetValue" TEXT,
    "agentId" TEXT,
    "sensorId" TEXT,
    "sourceIp" TEXT,
    "sourcePort" INTEGER,
    "sourceHostname" TEXT,
    "sourceCountry" TEXT,
    "destIp" TEXT,
    "destPort" INTEGER,
    "destHostname" TEXT,
    "destCountry" TEXT,
    "protocol" TEXT,
    "networkZone" TEXT,
    "bytesIn" INTEGER,
    "bytesOut" INTEGER,
    "packetsIn" INTEGER,
    "packetsOut" INTEGER,
    "fileName" TEXT,
    "filePath" TEXT,
    "fileHash" TEXT,
    "fileHashType" TEXT,
    "fileSize" INTEGER,
    "processName" TEXT,
    "processId" INTEGER,
    "processCommandLine" TEXT,
    "parentProcess" TEXT,
    "parentProcessId" INTEGER,
    "ruleId" TEXT,
    "ruleName" TEXT,
    "ruleVersion" TEXT,
    "correlationId" TEXT,
    "correlationName" TEXT,
    "notableEventId" TEXT,
    "previousNotableCount" INTEGER DEFAULT 0,
    "relatedAlertIds" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "duration" INTEGER,
    "firstSeen" DATETIME,
    "lastSeen" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assignedTo" TEXT,
    "assignedTeam" TEXT,
    "investigationStatus" TEXT,
    "incidentId" TEXT,
    "caseId" TEXT,
    "ticketId" TEXT,
    "playbookName" TEXT,
    "automationStatus" TEXT,
    "complianceFramework" TEXT,
    "policyViolation" TEXT,
    "policyName" TEXT,
    "regulatoryRequirement" TEXT,
    "dataClassification" TEXT,
    "matchedEventIds" TEXT NOT NULL,
    "evidenceIds" TEXT,
    "artifactIds" TEXT,
    "reasoning" TEXT NOT NULL,
    "attackPath" TEXT,
    "remediationSteps" TEXT,
    "sourceSystem" TEXT,
    "sourceIndex" TEXT,
    "sourceType" TEXT,
    "vendor" TEXT,
    "product" TEXT,
    "version" TEXT,
    "tags" TEXT,
    "labels" TEXT,
    "customFields" TEXT,
    "rawEvent" TEXT
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "noteType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "actorType" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "fromValue" TEXT,
    "toValue" TEXT,
    CONSTRAINT "AuditLog_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MitreTactic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tacticId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MitreTechnique" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "techniqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "tacticId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MitreTechnique_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "MitreTactic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MitreSubTechnique" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subTechniqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "techniqueId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MitreSubTechnique_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "MitreTechnique" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttackScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "tacticNames" TEXT NOT NULL,
    "techniqueNames" TEXT NOT NULL,
    "tags" TEXT,
    "author" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LogTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "delay" INTEGER NOT NULL DEFAULT 0,
    "template" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogTemplate_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "AttackScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetectionRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "detectorType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "conditions" TEXT NOT NULL,
    "mitreTactics" TEXT NOT NULL,
    "mitreTechniques" TEXT NOT NULL,
    "signals" TEXT NOT NULL,
    "author" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThreatIntelligence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iocType" TEXT NOT NULL,
    "iocValue" TEXT NOT NULL,
    "threatActor" TEXT,
    "threatGroup" TEXT,
    "malwareFamily" TEXT,
    "campaignName" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "source" TEXT,
    "sourceUrl" TEXT,
    "firstSeen" DATETIME NOT NULL,
    "lastSeen" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "notes" TEXT,
    "references" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThreatIntelCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicator" TEXT NOT NULL,
    "indicatorType" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "IOCMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "alertId" TEXT,
    "iocType" TEXT NOT NULL,
    "iocValue" TEXT NOT NULL,
    "matchedField" TEXT NOT NULL,
    "threatIntelId" TEXT,
    "threatActor" TEXT,
    "malwareFamily" TEXT,
    "severity" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AttackNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nodeType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "alertId" TEXT,
    "eventId" TEXT,
    "technique" TEXT,
    "tactic" TEXT,
    "entityType" TEXT,
    "entityValue" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "riskScore" REAL NOT NULL DEFAULT 0,
    "timestamp" DATETIME NOT NULL,
    "metadata" TEXT NOT NULL,
    "chainIds" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AttackEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "edgeType" TEXT NOT NULL,
    "relationship" TEXT,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "timestamp" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttackEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AttackNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttackEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "AttackNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttackChain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "severity" TEXT NOT NULL,
    "tactics" TEXT NOT NULL,
    "techniques" TEXT NOT NULL,
    "nodeIds" TEXT NOT NULL,
    "edgeIds" TEXT,
    "users" TEXT,
    "hosts" TEXT,
    "ips" TEXT,
    "riskScore" REAL NOT NULL DEFAULT 0,
    "impactScore" REAL,
    "assignedTo" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metricType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT,
    "timestamp" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "severity" TEXT,
    "detector" TEXT,
    "tactic" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "framework" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "controlName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "score" REAL,
    "evidenceType" TEXT,
    "evidenceIds" TEXT,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "assessedBy" TEXT,
    "assessedAt" DATETIME NOT NULL,
    "nextReview" DATETIME,
    "findings" TEXT,
    "remediation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrendData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataType" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "count" INTEGER,
    "sum" REAL,
    "avg" REAL,
    "min" REAL,
    "max" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "autoExecute" BOOLEAN NOT NULL DEFAULT false,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "timeout" INTEGER NOT NULL DEFAULT 300,
    "author" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "tags" TEXT,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlaybookAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playbookId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "condition" TEXT,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "retryDelay" INTEGER NOT NULL DEFAULT 5,
    "timeout" INTEGER NOT NULL DEFAULT 60,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlaybookAction_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaybookExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playbookId" TEXT NOT NULL,
    "alertId" TEXT,
    "eventId" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "results" TEXT NOT NULL,
    "approvalStatus" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "error" TEXT,
    "failedAction" TEXT,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlaybookExecution_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaybookApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "decidedBy" TEXT,
    "decidedAt" DATETIME,
    "comments" TEXT,
    "actionType" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_AttackScenarioToMitreTechnique" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AttackScenarioToMitreTechnique_A_fkey" FOREIGN KEY ("A") REFERENCES "AttackScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AttackScenarioToMitreTechnique_B_fkey" FOREIGN KEY ("B") REFERENCES "MitreTechnique" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DetectionRuleToMitreTechnique" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DetectionRuleToMitreTechnique_A_fkey" FOREIGN KEY ("A") REFERENCES "DetectionRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DetectionRuleToMitreTechnique_B_fkey" FOREIGN KEY ("B") REFERENCES "MitreTechnique" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_priority_idx" ON "Alert"("priority");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_user_idx" ON "Alert"("user");

-- CreateIndex
CREATE INDEX "Alert_hostName_idx" ON "Alert"("hostName");

-- CreateIndex
CREATE INDEX "Alert_sourceIp_idx" ON "Alert"("sourceIp");

-- CreateIndex
CREATE INDEX "Alert_riskScore_idx" ON "Alert"("riskScore");

-- CreateIndex
CREATE INDEX "Alert_threatActor_idx" ON "Alert"("threatActor");

-- CreateIndex
CREATE INDEX "Alert_ruleId_idx" ON "Alert"("ruleId");

-- CreateIndex
CREATE UNIQUE INDEX "MitreTactic_tacticId_key" ON "MitreTactic"("tacticId");

-- CreateIndex
CREATE INDEX "MitreTactic_tacticId_idx" ON "MitreTactic"("tacticId");

-- CreateIndex
CREATE INDEX "MitreTactic_order_idx" ON "MitreTactic"("order");

-- CreateIndex
CREATE UNIQUE INDEX "MitreTechnique_techniqueId_key" ON "MitreTechnique"("techniqueId");

-- CreateIndex
CREATE INDEX "MitreTechnique_techniqueId_idx" ON "MitreTechnique"("techniqueId");

-- CreateIndex
CREATE INDEX "MitreTechnique_tacticId_idx" ON "MitreTechnique"("tacticId");

-- CreateIndex
CREATE UNIQUE INDEX "MitreSubTechnique_subTechniqueId_key" ON "MitreSubTechnique"("subTechniqueId");

-- CreateIndex
CREATE INDEX "MitreSubTechnique_subTechniqueId_idx" ON "MitreSubTechnique"("subTechniqueId");

-- CreateIndex
CREATE INDEX "MitreSubTechnique_techniqueId_idx" ON "MitreSubTechnique"("techniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "AttackScenario_scenarioId_key" ON "AttackScenario"("scenarioId");

-- CreateIndex
CREATE INDEX "AttackScenario_severity_idx" ON "AttackScenario"("severity");

-- CreateIndex
CREATE INDEX "AttackScenario_enabled_idx" ON "AttackScenario"("enabled");

-- CreateIndex
CREATE INDEX "AttackScenario_category_idx" ON "AttackScenario"("category");

-- CreateIndex
CREATE INDEX "LogTemplate_scenarioId_idx" ON "LogTemplate"("scenarioId");

-- CreateIndex
CREATE INDEX "LogTemplate_order_idx" ON "LogTemplate"("order");

-- CreateIndex
CREATE UNIQUE INDEX "DetectionRule_ruleId_key" ON "DetectionRule"("ruleId");

-- CreateIndex
CREATE INDEX "DetectionRule_enabled_idx" ON "DetectionRule"("enabled");

-- CreateIndex
CREATE INDEX "DetectionRule_detectorType_idx" ON "DetectionRule"("detectorType");

-- CreateIndex
CREATE INDEX "DetectionRule_severity_idx" ON "DetectionRule"("severity");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_iocType_idx" ON "ThreatIntelligence"("iocType");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_active_idx" ON "ThreatIntelligence"("active");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_expiresAt_idx" ON "ThreatIntelligence"("expiresAt");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_severity_idx" ON "ThreatIntelligence"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatIntelligence_iocType_iocValue_key" ON "ThreatIntelligence"("iocType", "iocValue");

-- CreateIndex
CREATE INDEX "ThreatIntelCache_indicator_idx" ON "ThreatIntelCache"("indicator");

-- CreateIndex
CREATE INDEX "ThreatIntelCache_indicatorType_idx" ON "ThreatIntelCache"("indicatorType");

-- CreateIndex
CREATE INDEX "ThreatIntelCache_expiresAt_idx" ON "ThreatIntelCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatIntelCache_indicator_indicatorType_key" ON "ThreatIntelCache"("indicator", "indicatorType");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_category_idx" ON "SystemConfig"("category");

-- CreateIndex
CREATE INDEX "SystemConfig_isPublic_idx" ON "SystemConfig"("isPublic");

-- CreateIndex
CREATE INDEX "IOCMatch_eventId_idx" ON "IOCMatch"("eventId");

-- CreateIndex
CREATE INDEX "IOCMatch_alertId_idx" ON "IOCMatch"("alertId");

-- CreateIndex
CREATE INDEX "IOCMatch_iocValue_idx" ON "IOCMatch"("iocValue");

-- CreateIndex
CREATE INDEX "IOCMatch_createdAt_idx" ON "IOCMatch"("createdAt");

-- CreateIndex
CREATE INDEX "AttackNode_nodeType_idx" ON "AttackNode"("nodeType");

-- CreateIndex
CREATE INDEX "AttackNode_alertId_idx" ON "AttackNode"("alertId");

-- CreateIndex
CREATE INDEX "AttackNode_timestamp_idx" ON "AttackNode"("timestamp");

-- CreateIndex
CREATE INDEX "AttackNode_severity_idx" ON "AttackNode"("severity");

-- CreateIndex
CREATE INDEX "AttackEdge_sourceId_idx" ON "AttackEdge"("sourceId");

-- CreateIndex
CREATE INDEX "AttackEdge_targetId_idx" ON "AttackEdge"("targetId");

-- CreateIndex
CREATE INDEX "AttackEdge_edgeType_idx" ON "AttackEdge"("edgeType");

-- CreateIndex
CREATE INDEX "AttackChain_status_idx" ON "AttackChain"("status");

-- CreateIndex
CREATE INDEX "AttackChain_severity_idx" ON "AttackChain"("severity");

-- CreateIndex
CREATE INDEX "AttackChain_startTime_idx" ON "AttackChain"("startTime");

-- CreateIndex
CREATE INDEX "AttackChain_riskScore_idx" ON "AttackChain"("riskScore");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_metricType_idx" ON "AnalyticsMetric"("metricType");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_period_idx" ON "AnalyticsMetric"("period");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_timestamp_idx" ON "AnalyticsMetric"("timestamp");

-- CreateIndex
CREATE INDEX "ComplianceCheck_framework_idx" ON "ComplianceCheck"("framework");

-- CreateIndex
CREATE INDEX "ComplianceCheck_status_idx" ON "ComplianceCheck"("status");

-- CreateIndex
CREATE INDEX "ComplianceCheck_assessedAt_idx" ON "ComplianceCheck"("assessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCheck_framework_controlId_key" ON "ComplianceCheck"("framework", "controlId");

-- CreateIndex
CREATE INDEX "TrendData_dataType_idx" ON "TrendData"("dataType");

-- CreateIndex
CREATE INDEX "TrendData_period_idx" ON "TrendData"("period");

-- CreateIndex
CREATE INDEX "TrendData_timestamp_idx" ON "TrendData"("timestamp");

-- CreateIndex
CREATE INDEX "Playbook_enabled_idx" ON "Playbook"("enabled");

-- CreateIndex
CREATE INDEX "Playbook_priority_idx" ON "Playbook"("priority");

-- CreateIndex
CREATE INDEX "PlaybookAction_playbookId_idx" ON "PlaybookAction"("playbookId");

-- CreateIndex
CREATE INDEX "PlaybookAction_order_idx" ON "PlaybookAction"("order");

-- CreateIndex
CREATE INDEX "PlaybookExecution_playbookId_idx" ON "PlaybookExecution"("playbookId");

-- CreateIndex
CREATE INDEX "PlaybookExecution_status_idx" ON "PlaybookExecution"("status");

-- CreateIndex
CREATE INDEX "PlaybookExecution_startTime_idx" ON "PlaybookExecution"("startTime");

-- CreateIndex
CREATE INDEX "PlaybookExecution_alertId_idx" ON "PlaybookExecution"("alertId");

-- CreateIndex
CREATE INDEX "PlaybookApproval_executionId_idx" ON "PlaybookApproval"("executionId");

-- CreateIndex
CREATE INDEX "PlaybookApproval_status_idx" ON "PlaybookApproval"("status");

-- CreateIndex
CREATE INDEX "PlaybookApproval_requestedAt_idx" ON "PlaybookApproval"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "_AttackScenarioToMitreTechnique_AB_unique" ON "_AttackScenarioToMitreTechnique"("A", "B");

-- CreateIndex
CREATE INDEX "_AttackScenarioToMitreTechnique_B_index" ON "_AttackScenarioToMitreTechnique"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DetectionRuleToMitreTechnique_AB_unique" ON "_DetectionRuleToMitreTechnique"("A", "B");

-- CreateIndex
CREATE INDEX "_DetectionRuleToMitreTechnique_B_index" ON "_DetectionRuleToMitreTechnique"("B");
