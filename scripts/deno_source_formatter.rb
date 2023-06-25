#!/usr/bin/env ruby
Dir.glob(__dir__ + '/../src_deno/**/*').select { |f| File.file? f }.each do |filepath|
  output = "";
  File.readlines(filepath).each do |line|
    if line.include?(' from "')
      if line.include?(' from "slack-web-api-client"')
        output += line.sub(/slack-web-api-client/, 'https://deno.land/x/slack_web_api_client@0.3.1/mod.ts')
      else
        output += line.sub(/";$/, '.ts";')
      end
    else
      output += line
    end
  end
  File.open(filepath, 'w') { |f| f.write(output) }
end

File.open(__dir__ + '/../src_deno/mod.ts', 'w') { |f|
  f.write('export * from "./index.ts"' + "\n")
}
