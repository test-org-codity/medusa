import { Logger, NotificationTypes } from "@medusajs/framework/types"
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { MedusaCloudEmailOptions } from "@types"

export class MedusaCloudEmailNotificationProvider extends AbstractNotificationProviderService {
  static identifier = "notification-medusa-cloud-email"
  protected options_: MedusaCloudEmailOptions
  protected logger_: Logger

  constructor({ logger }: { logger: Logger }, options: MedusaCloudEmailOptions) {
    super()

    this.logger_ = logger
    this.options_ = options
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    let response: Response
    try {
      response = await fetch(`${this.options_.endpoint}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `api_key:${this.options_.api_key}`
          ).toString("base64")}`,
          "x-medusa-environment-handle": this.options_.environment_handle,
        },
        body: JSON.stringify({
          to: notification.to,
          from: notification.from,
          attachments: notification.attachments,
          template: notification.template,
          data: notification.data,
          content: notification.content,
        }),
      })
    } catch (error) {
      this.logger_?.error(`Failed to send email: ${error.message}`)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    let responseBody
    try {
      responseBody = await response.json()
    } catch (parseError) {
      const message = `Failed to send email: ${response.status} - ${response.statusText}: Could not parse response body`
      this.logger_?.error(message)
      throw new Error(message)
    }

    if (!response.ok) {
      const message = `Failed to send email: ${response.status} - ${response.statusText}: ${responseBody.message}`
      this.logger_?.error(message)
      throw new Error(message)
    }

    return { id: responseBody.id }
  }
}
