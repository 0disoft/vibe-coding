<script lang="ts">
  import {
    DsCard,
    DsCheckbox,
    DsField,
    DsFileUpload,
    DsInput,
    DsMultiSelect,
    DsNumberInput,
    DsOtpInput,
    DsPasswordInput,
    DsProgress,
    DsRadioGroup,
    DsRadioItem,
    DsRangeSlider,
    DsSelect,
    DsSlider,
    DsSwitch,
    DsTag,
    DsTagInput,
    DsTextarea,
    DsTimePicker,
  } from "$lib/components/design-system";

  import { toast } from "$lib/stores/toast.svelte";

  let inputValue = $state("");
  let textareaValue = $state("");
  let newsletter = $state(false);
  let plan = $state("pro");
  let quantity = $state<number | null>(3);
  let tagValues = $state<string[]>(["pro", "team"]);
  let tagInputValues = $state<string[]>(["vibe", "design-system"]);
  let otp = $state("");
  let timeValue = $state<string | null>("09:30");
  let sliderValue = $state(35);
  let rangeValue = $state<[number, number]>([20, 80]);

  let progressValue = $derived(Math.min(100, Math.max(0, inputValue.length * 10)));
</script>

<section id="ds-forms" class="space-y-4">
  <h2 class="text-h2 font-semibold">Forms</h2>
  <DsCard class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <DsField
        label="Email"
        helpText="clearable + adornment 예시"
        invalid={inputValue.length > 0 && !inputValue.includes("@")}
        errorText="이메일 형식이 아닙니다."
      >
        {#snippet children(control)}
          <DsInput {...control} placeholder="name@example.com" clearable bind:value={inputValue}>
            {#snippet start()}
              <span class="i-lucide-mail h-4 w-4 text-muted-foreground"></span>
            {/snippet}
          </DsInput>
        {/snippet}
      </DsField>

      <DsField label="Plan" helpText="Select (Dropdown 기반)">
        {#snippet children(control)}
          <DsSelect
            id={control.id}
            describedBy={control["aria-describedby"]}
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "team", label: "Team" },
            ]}
            bind:value={plan}
          />
        {/snippet}
      </DsField>

      <DsField label="Quantity" helpText="NumberInput (stepper + ArrowUp/Down)">
        {#snippet children(control)}
          <DsNumberInput
            {...control}
            placeholder="0"
            min={0}
            max={99}
            step={1}
            bind:value={quantity}
          />
        {/snippet}
      </DsField>

      <DsField label="Tags" helpText="MultiSelect (Dropdown 기반)">
        {#snippet children(control)}
          <DsMultiSelect
            id={control.id}
            describedBy={control["aria-describedby"]}
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "team", label: "Team" },
              { value: "enterprise", label: "Enterprise" },
            ]}
            bind:values={tagValues}
          />
        {/snippet}
      </DsField>

      <DsField label="TagInput" helpText="쉼표/Enter/Tab 입력 + Paste 분해">
        {#snippet children(control)}
          <DsTagInput
            id={control.id}
            describedBy={control["aria-describedby"]}
            placeholder="태그를 입력하고 Enter"
            bind:values={tagInputValues}
          />
        {/snippet}
      </DsField>
    </div>

    <DsField label="Message" helpText="Textarea">
      {#snippet children(control)}
        <DsTextarea
          id={control.id}
          aria-describedby={control["aria-describedby"]}
          placeholder="내용을 입력하세요"
          rows={4}
          bind:value={textareaValue}
        />
      {/snippet}
    </DsField>

    <DsField label="Time" helpText="TimePicker (native input type=time)">
      {#snippet children(control)}
        <DsTimePicker
          id={control.id}
          aria-describedby={control["aria-describedby"]}
          bind:value={timeValue}
        />
      {/snippet}
    </DsField>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">FileUpload</div>
      <DsFileUpload accept="image/*,.pdf" maxFiles={5} maxSizeBytes={5 * 1024 * 1024} />
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <DsCheckbox bind:checked={newsletter}>뉴스레터 구독</DsCheckbox>
      <DsSwitch bind:checked={newsletter} label="알림 설정" />
      <DsTag intent="secondary" variant="soft">tag: {newsletter ? "on" : "off"}</DsTag>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">RadioGroup</div>
      <DsRadioGroup bind:value={plan} name="plan">
        <DsRadioItem value="free" label="Free" description="개인용" />
        <DsRadioItem value="pro" label="Pro" description="전문가" />
        <DsRadioItem value="team" label="Team" description="협업" />
      </DsRadioGroup>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">PasswordInput</div>
        <DsPasswordInput placeholder="비밀번호" showStrength autocomplete="new-password" />
      </div>
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">OtpInput</div>
        <DsOtpInput length={6} bind:value={otp} onComplete={(code) => toast.success("OTP", code)} />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Progress</div>
      <div class="flex items-center gap-3">
        <DsProgress value={progressValue} max={100} />
        <DsProgress indeterminate size="sm" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <DsField label="Slider" helpText="단일 값 슬라이더">
        {#snippet children(control)}
          <div class="space-y-2">
            <DsSlider
              id={control.id}
              describedBy={control["aria-describedby"]}
              min={0}
              max={100}
              step={1}
              bind:value={sliderValue}
              label="Slider"
            />
            <div class="text-helper text-muted-foreground">value: {sliderValue}</div>
          </div>
        {/snippet}
      </DsField>

      <DsField label="RangeSlider" helpText="범위 슬라이더(2 thumb)">
        {#snippet children(control)}
          <div class="space-y-2">
            <DsRangeSlider
              describedBy={control["aria-describedby"]}
              min={0}
              max={100}
              step={1}
              bind:value={rangeValue}
              minLabel="Minimum value"
              maxLabel="Maximum value"
            />
            <div class="text-helper text-muted-foreground">
              value: {rangeValue[0]} ~ {rangeValue[1]}
            </div>
          </div>
        {/snippet}
      </DsField>
    </div>
  </DsCard>
</section>
